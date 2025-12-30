
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
import { LogOut, WifiOff, Waves } from 'lucide-react';

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
  const [navLogoError, setNavLogoError] = useState(false);
  const [loadLogoError, setLoadLogoError] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-white text-center p-4">
        <div className="animate-in fade-in zoom-in duration-1000">
          <div className="relative mb-10 flex justify-center">
             <div className="w-40 h-40 border-[4px] border-[#00AEEF]/10 border-t-[#0054A6] rounded-full animate-spin absolute inset-0 -m-2 shadow-[0_0_30px_rgba(0,174,239,0.1)]"></div>
             <div className="bg-white p-3 rounded-full shadow-2xl relative z-10 w-36 h-36 overflow-hidden flex items-center justify-center border-4 border-[#F0F9FF]">
                {!loadLogoError ? (
                  <img src="logo.png?v=yunus-v1" alt="Yunuslar" onError={() => setLoadLogoError(true)} className="w-full h-full object-contain" />
                ) : (
                  <Waves className="w-16 h-16 text-[#00AEEF] animate-pulse" />
                )}
             </div>
          </div>
          <h2 className="text-3xl font-black text-[#0054A6] tracking-tighter italic mb-1 uppercase">Yunuslar İzin</h2>
          <p className="text-[#00AEEF] font-bold tracking-[0.5em] text-[10px] uppercase">Güvenle Bağlanılıyor</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-center p-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-red-100 max-w-sm">
          <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <WifiOff className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 italic">Ağ Hatası</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Veri tabanına ulaşılamadı. Lütfen internetinizi kontrol edin.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-100 transition-transform active:scale-95">SİSTEMİ YENİLE</button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <nav className="bg-white/80 backdrop-blur-2xl border-b border-[#E2E8F0] sticky top-0 z-[100] px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between h-20 items-center">
          <div className="flex items-center gap-5">
            <div className="bg-white p-1 rounded-full shadow-lg border border-[#F1F5F9] ring-4 ring-[#00AEEF]/10 w-14 h-14 flex items-center justify-center overflow-hidden transition-transform hover:rotate-3">
              {!navLogoError ? (
                <img src="logo.png?v=yunus-v1" alt="Logo" onError={() => setNavLogoError(true)} className="w-full h-full object-contain" />
              ) : (
                <Waves className="w-7 h-7 text-[#00AEEF]" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-[#0054A6] tracking-tighter leading-none italic">YUNUSLAR</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#10B981] animate-pulse shadow-[0_0_10px_#10B981]' : 'bg-[#EF4444]'}`}></div>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase italic">
                  {isOnline ? 'Sistem Çevrimiçi' : 'Bağlantı Kesik'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="hidden xs:flex flex-col items-end">
              <p className="text-[10px] font-black text-[#00AEEF] uppercase tracking-widest leading-none mb-1">PERSONEL</p>
              <p className="text-sm font-bold text-[#0054A6]">{currentUser.name}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 shadow-sm"
              title="Güvenli Çıkış"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'ADMIN' ? (
          <AdminDashboard requests={requests} users={users} onAction={handleActionRequest} />
        ) : (
          <EmployeeDashboard user={currentUser} requests={requests} onAddRequest={handleAddRequest} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 text-center mt-12">
          <div className="flex justify-center mb-6">
             {!navLogoError ? (
               <img src="logo.png?v=yunus-v1" alt="Yunuslar" className="w-16 h-16 grayscale opacity-20 object-contain hover:opacity-50 transition-opacity" />
             ) : (
               <Waves className="w-10 h-10 text-slate-200" />
             )}
          </div>
          <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em] italic">
            YUNUSLAR LOJİSTİK AKILLI PORTAL • 2024
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
             <div className="h-[1px] w-8 bg-slate-100"></div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Tim Şefi: Murat TOPCU
             </p>
             <div className="h-[1px] w-8 bg-slate-100"></div>
          </div>
      </footer>
    </div>
  );
};

export default App;
