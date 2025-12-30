
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { INITIAL_USERS } from './constants';
import { User, LeaveRequest } from './types';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';
import { checkOverlaps, calculateDays } from './utils';
import { LogOut, WifiOff } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyDFxNdDT3mgbYSQ4DxfEeZqld1HQnsK7qc",
  authDomain: "yunuslar-izin.firebaseapp.com",
  databaseURL: "https://yunuslar-izin-default-rtdb.firebaseio.com",
  projectId: "yunuslar-izin",
  storageBucket: "yunuslar-izin.firebasestorage.app",
  messagingSenderId: "888750536548",
  appId: "1:888750536548:web:674459ad615253b447ac71",
  measurementId: "G-FJD8ZXK47F"
};

let database: any;

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      database = getDatabase(app);
      if (typeof window !== 'undefined') {
        getAnalytics(app);
      }

      const usersRef = ref(database, 'users');
      const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const usersList = Object.values(data) as User[];
          setUsers(usersList);
          if (currentUser) {
            const updatedMe = usersList.find(u => u.id === currentUser.id);
            if (updatedMe) setCurrentUser(updatedMe);
          }
        } else {
          INITIAL_USERS.forEach(user => {
            set(ref(database, 'users/' + user.id), user);
          });
        }
      });

      const requestsRef = ref(database, 'requests');
      const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setRequests(Object.values(data) as LeaveRequest[]);
        } else {
          setRequests([]);
        }
        setLoading(false);
      });

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        unsubscribeUsers();
        unsubscribeRequests();
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } catch (e) {
      setDbError("Sistem başlatılamadı.");
      setLoading(false);
    }
  }, [currentUser?.id]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  const handleAddRequest = useCallback((newRequest: LeaveRequest) => {
    if (!database) return;
    const overlaps = checkOverlaps(newRequest.startDate, newRequest.endDate, requests);
    if (overlaps.length >= 2) {
      const sortedOverlaps = [...overlaps].sort((a, b) => a.seniorityAtRequest - b.seniorityAtRequest);
      const lowestInSlot = sortedOverlaps[0];
      if (newRequest.seniorityAtRequest > lowestInSlot.seniorityAtRequest) {
        update(ref(database, `requests/${lowestInSlot.id}`), {
          status: 'REJECTED',
          rejectionReason: 'SİCİLİN YETMEDİ (Daha kıdemli personel başvurusu geldi)'
        });
        set(ref(database, `requests/${newRequest.id}`), newRequest);
      }
    } else {
      set(ref(database, `requests/${newRequest.id}`), newRequest);
    }
  }, [requests]);

  const handleActionRequest = (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!database) return;
    update(ref(database, `requests/${id}`), { status });
    if (status === 'APPROVED') {
      const request = requests.find(r => r.id === id);
      const user = users.find(u => u.id === request?.userId);
      if (user && request) {
        const days = calculateDays(request.startDate, request.endDate);
        update(ref(database, `users/${user.id}`), {
          usedLeaveDays: (user.usedLeaveDays || 0) + days
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative mb-8 flex justify-center">
            <div className="w-40 h-40 border-[4px] border-[#00AEEF]/20 border-t-[#0054A6] rounded-full animate-spin absolute inset-0 -m-2"></div>
            <Logo size="xl" className="shadow-2xl" />
          </div>
          <h2 className="text-2xl font-black text-[#0054A6] tracking-tighter italic">YUNUSLAR PORTAL</h2>
          <p className="text-[#00AEEF] font-bold text-[10px] uppercase tracking-[0.5em] mt-2">Veriler Senkronize Ediliyor</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-sm">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Bağlantı Hatası</h2>
          <button onClick={() => window.location.reload()} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl mt-6">TEKRAR DENE</button>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Login onLogin={handleLogin} users={users} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9]">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100] px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between h-20 items-center">
          <div className="flex items-center gap-4">
            <Logo size="sm" className="shadow-md" />
            <div>
              <h1 className="text-xl font-black text-[#0054A6] tracking-tighter italic leading-none">YUNUSLAR</h1>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                {isOnline ? '● AKTİF' : '○ ÇEVRİMDIŞI'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-[#00AEEF] uppercase">{currentUser.role}</p>
              <p className="text-sm font-bold text-slate-700">{currentUser.name}</p>
            </div>
            <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-red-600 bg-slate-50 rounded-2xl transition-all">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {currentUser.role === 'ADMIN' ? (
          <AdminDashboard requests={requests} users={users} onAction={handleActionRequest} />
        ) : (
          <EmployeeDashboard user={currentUser} requests={requests} onAddRequest={handleAddRequest} />
        )}
      </main>

      <footer className="bg-white py-12 text-center mt-auto border-t border-slate-200">
        <div className="flex justify-center mb-6">
          <Logo size="sm" className="grayscale opacity-30" />
        </div>
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em]">
          YUNUSLAR PERSONEL PORTALI • 2024
        </p>
      </footer>
    </div>
  );
};

export default App;
