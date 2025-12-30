
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

// Kullanıcının sağladığı gerçek Firebase Config
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

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Kullanıcıları Dinle
    const usersRef = ref(db, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase nesne olarak dönebilir, diziye çeviriyoruz
        const usersList = Object.values(data) as User[];
        setUsers(usersList);
        
        if (currentUser) {
          const updatedMe = usersList.find(u => u.id === currentUser.id);
          if (updatedMe) setCurrentUser(updatedMe);
        }
      } else {
        // Eğer veritabanı bomboşsa ilk kurulumu yap
        INITIAL_USERS.forEach(user => {
          set(ref(db, 'users/' + user.id), user);
        });
      }
    });

    // 2. Talepleri Dinle
    const requestsRef = ref(db, 'requests');
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
  }, [currentUser?.id]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddRequest = useCallback((newRequest: LeaveRequest) => {
    const overlaps = checkOverlaps(newRequest.startDate, newRequest.endDate, requests);
    
    if (overlaps.length >= 2) {
      const sortedOverlaps = [...overlaps].sort((a, b) => a.seniorityAtRequest - b.seniorityAtRequest);
      const lowestInSlot = sortedOverlaps[0];

      if (newRequest.seniorityAtRequest > lowestInSlot.seniorityAtRequest) {
        // Mevcut en düşük kıdemliyi reddet
        update(ref(db, `requests/${lowestInSlot.id}`), {
          status: 'REJECTED',
          rejectionReason: 'SİCİLİN YETMEDİ (Daha kıdemli bir personel bu tarihe başvuru yaptı)'
        });
        // Yeni talebi ekle
        set(ref(db, `requests/${newRequest.id}`), newRequest);
      }
    } else {
      set(ref(db, `requests/${newRequest.id}`), newRequest);
    }
  }, [requests]);

  const handleActionRequest = (id: string, status: 'APPROVED' | 'REJECTED') => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    update(ref(db, `requests/${id}`), { status });

    if (status === 'APPROVED') {
      const user = users.find(u => u.id === request.userId);
      if (user) {
        const days = calculateDays(request.startDate, request.endDate);
        update(ref(db, `users/${user.id}`), {
          usedLeaveDays: (user.usedLeaveDays || 0) + days
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold animate-pulse tracking-widest">YUNUSLAR SİSTEMİ BAŞLATILIYOR...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">YUNUSLAR İZİN</h1>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                {isOnline ? <Wifi className="w-3 h-3"/> : <WifiOff className="w-3 h-3"/>}
                {isOnline ? 'BULUT BAĞLANTISI AKTİF' : 'ÇEVRİMDIŞI MOD'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Giriş Yapıldı</p>
              <p className="text-xs font-bold text-slate-700">{currentUser.name}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" /> <span className="hidden xs:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {currentUser.role === 'ADMIN' ? (
          <AdminDashboard requests={requests} users={users} onAction={handleActionRequest} />
        ) : (
          <EmployeeDashboard user={currentUser} requests={requests} onAddRequest={handleAddRequest} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">
            © 2024 YUNUSLAR LOJİSTİK • TİM ŞEFİ: MURAT TOPCU
          </p>
      </footer>
    </div>
  );
};

export default App;
