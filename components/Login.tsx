
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [sicilNo, setSicilNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    <div className="min-h-screen flex items-center justify-center bg-[#E0F2FE] px-4 relative overflow-hidden">
      {/* Arka Plan Dekorasyonu */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00AEEF]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0054A6]/10 rounded-full blur-[120px]"></div>

      <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,84,166,0.2)] w-full max-w-md border border-white relative z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00AEEF]/20 rounded-full blur-xl animate-pulse"></div>
              <Logo size="xl" className="relative z-10 border-4 border-white shadow-2xl" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-[#0054A6] tracking-tighter italic">YUNUSLAR</h2>
          <p className="text-[#00AEEF] text-xs font-black uppercase tracking-[0.4em] mt-2">Personel İzin Portalı</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in fade-in zoom-in">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Personel Sicil</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#00AEEF] transition-colors" />
              <input 
                type="text" 
                value={sicilNo}
                onChange={(e) => setSicilNo(e.target.value)}
                placeholder="40xxxx"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#00AEEF]/10 focus:border-[#00AEEF] outline-none font-bold text-slate-700 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Şifre</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#00AEEF] transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#00AEEF]/10 focus:border-[#00AEEF] outline-none font-bold text-slate-700 transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-[#0054A6] to-[#00AEEF] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#0054A6]/30 transition-all active:scale-[0.97] uppercase tracking-widest text-xs flex items-center justify-center gap-3"
          >
            SİSTEME GİRİŞ
          </button>
        </form>

        <div className="mt-12 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            YUNUSLAR • 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
