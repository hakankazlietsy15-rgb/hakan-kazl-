
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { INITIAL_USERS } from './constants';
import { User, LeaveRequest } from './types';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import { checkOverlaps, calculateDays } from './utils';
import { LogOut, Calendar, Wifi, WifiOff } from 'lucide-react';

// Firebase Yapılandırması
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

// Global değişkenler yerine useEffect içinde yönetmek daha güvenli
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

      // 1. Kullanıcıları Dinle
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
          // İlk Kurulum
          INITIAL_USERS.forEach(user => {
            set(ref(database, 'users/' + user.id), user);
          });
        }
      }, (error) => {
        console.error("Firebase Kullanıcı Hatası:", error);
        setDbError("Veritabanı bağlantısı kurulamadı.");
      });

      // 2. Talepleri Dinle
      const requestsRef = ref(database, 'requests');
      const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setRequests(Object.values(data) as LeaveRequest[]);
        } else {
          setRequests([]);
        }
        setLoading(false);
      }, (error) => {
        console.error("Firebase Talep Hatası:", error);
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
      console.error("Başlatma Hatası:", e);
      setDbError("Uygulama başlatılamadı.");
      setLoading(false);
    }
  }, [currentUser?.id]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddRequest = useCallback((newRequest: LeaveRequest) => {
    if (!database) return;
    const overlaps = checkOverlaps(newRequest.startDate, newRequest.endDate, requests);
    
    if (overlaps.length >= 2) {
      const sortedOverlaps = [...overlaps].sort((a, b) => a.seniorityAtRequest - b.seniorityAtRequest);
      const lowestInSlot = sortedOverlaps[0];

      if (newRequest.seniorityAtRequest > lowestInSlot.seniorityAtRequest) {
        update(ref(database, `requests/${lowestInSlot.id}`), {
          status: 'REJECTED',
          rejectionReason: 'SİCİLİN YETMEDİ (Daha kıdemli bir personel bu tarihe başvuru yaptı)'
        });
        set(ref(database, `requests/${newRequest.id}`), newRequest);
      }
    } else {
      set(ref(database, `requests/${newRequest.id}`), newRequest);
    }
  }, [requests]);

  const handleActionRequest = (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!database) return;
    const request = requests.find(r => r.id === id);
    if (!request) return;

    update(ref(database, `requests/${id}`), { status });

    if (status === 'APPROVED') {
      const user = users.find(u => u.id === request.userId);
      if (user) {
        const days = calculateDays(request.startDate, request.endDate);
        update(ref(database, `users/${user.id}`), {
          usedLeaveDays: (user.usedLeaveDays || 0) + days
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center p-4">
        <div>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">YUNUSLAR SİSTEMİ YÜKLENİYOR...</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-sm">
          <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Bağlantı Hatası</h2>
          <p className="text-slate-500 text-sm mb-6">{dbError}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl">Tekrar Dene</button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">YUNUSLAR İZİN</h1>
              <span className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                {isOnline ? <Wifi className="w-3 h-3"/> : <WifiOff className="w-3 h-3"/>}
                {isOnline ? 'SİSTEM ÇEVRİMİÇİ' : 'BAĞLANTI YOK'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden xs:block text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase">Kullanıcı</p>
              <p className="text-xs font-bold text-slate-700">{currentUser.name}</p>
            </div>
            <button onClick={handleLogout} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'ADMIN' ? (
          <AdminDashboard requests={requests} users={users} onAction={handleActionRequest} />
        ) : (
          <EmployeeDashboard user={currentUser} requests={requests} onAddRequest={handleAddRequest} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            © 2024 YUNUSLAR LOJİSTİK • TİM ŞEFİ: MURAT TOPCU
          </p>
      </footer>
    </div>
  );
};

export default App;
