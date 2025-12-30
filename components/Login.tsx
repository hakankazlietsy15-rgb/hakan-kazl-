
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, AlertCircle, Waves } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [sicilNo, setSicilNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.sicilNo === sicilNo && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Hatalı sicil numarası veya şifre!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF] px-4">
      <div className="bg-white p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,114,188,0.15)] w-full max-w-md border border-[#E0F2FE] relative overflow-hidden">
        {/* Dekoratif Logoya Uygun Dalgalar */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00AEEF]/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0054A6]/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="bg-white p-2 rounded-full shadow-[0_10px_30px_rgba(0,114,188,0.2)] border-4 border-[#F0F9FF] ring-8 ring-[#F0F9FF]/50 w-32 h-32 flex items-center justify-center overflow-hidden transition-transform hover:scale-105 duration-500">
               {!imgError ? (
                 <img 
                   src="logo.png?v=yunus-v1" 
                   alt="Yunuslar Lojistik" 
                   onError={() => setImgError(true)}
                   className="w-full h-full object-contain" 
                 />
               ) : (
                 <div className="bg-gradient-to-br from-[#00AEEF] to-[#0054A6] w-full h-full flex items-center justify-center">
                    <Waves className="text-white w-14 h-14 animate-pulse" />
                 </div>
               )}
            </div>
          </div>
          <h2 className="text-4xl font-black text-[#0054A6] tracking-tighter italic">YUNUSLAR</h2>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#00AEEF]"></div>
            <p className="text-[#00AEEF] text-[11px] font-black uppercase tracking-[0.4em]">İzin Portalı</p>
            <div className="h-[2px] w-10 bg-gradient-to-l from-transparent to-[#00AEEF]"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in fade-in zoom-in duration-300 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Personel Sicil No</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#00AEEF] transition-colors" />
              <input 
                type="text" 
                value={sicilNo}
                onChange={(e) => setSicilNo(e.target.value)}
                placeholder="40xxxx"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#00AEEF]/10 focus:border-[#00AEEF] transition-all outline-none font-bold text-slate-700"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sistem Şifresi</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#00AEEF] transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#00AEEF]/10 focus:border-[#00AEEF] transition-all outline-none font-bold text-slate-700"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#0054A6] hover:bg-[#00AEEF] text-white font-black py-5 rounded-2xl shadow-lg shadow-[#0054A6]/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3 group mt-4 overflow-hidden relative"
          >
            <span className="relative z-10">SİSTEME GİRİŞ YAP</span>
            <UserIcon className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-12 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            YUNUSLAR • LOJİSTİK • 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
