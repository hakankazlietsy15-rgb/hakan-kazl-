
import React from 'react';
import { LeaveRequest, User } from '../types';
import { calculateDays } from '../utils';
import { 
  Check, 
  X, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  requests: LeaveRequest[];
  users: User[];
  onAction: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, users, onAction }) => {
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const otherRequests = requests.filter(r => r.status !== 'PENDING');
  
  const stats = {
    total: requests.length,
    pending: pendingRequests.length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  };

  const getUserInfo = (userId: string) => users.find(u => u.id === userId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Yönetici Hoşgeldin Kartı */}
      <div className="relative bg-slate-900 rounded-[2rem] p-8 overflow-hidden shadow-2xl shadow-blue-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Yönetici Paneli</h2>
              <p className="text-blue-200 font-medium text-sm mt-1">Sayın Murat TOPCU, personelin tüm izin süreçleri sizin onayınızdadır.</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Bekleyen</p>
                <p className="text-xl font-black text-white">{stats.pending}</p>
             </div>
             <div className="bg-emerald-500/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-emerald-500/20">
                <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Onaylanan</p>
                <p className="text-xl font-black text-white">{stats.approved}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Onay Listesi */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                   <Clock className="w-5 h-5 text-amber-500" />
                   AKTİF TALEPLER
                </h3>
             </div>

             <div className="divide-y divide-slate-100">
                {pendingRequests.length === 0 ? (
                  <div className="p-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                       <CheckCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold">Bekleyen başvuru bulunmuyor.</p>
                  </div>
                ) : (
                  pendingRequests.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(req => {
                    const user = getUserInfo(req.userId);
                    const days = calculateDays(req.startDate, req.endDate);
                    return (
                      <div key={req.id} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-all group relative">
                        {/* Kıdem Vurgusu */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex flex-col sm:flex-row justify-between gap-6">
                          <div className="flex gap-4">
                             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg shadow-sm border border-blue-100 uppercase">
                                {req.userName.charAt(0)}
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-900 text-base">{req.userName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Sicil: {user?.sicilNo}</span>
                                   <span className="text-[10px] font-black text-blue-500 uppercase bg-blue-50 px-2 py-0.5 rounded">Bakiye: {user ? user.totalLeaveEntitlement - user.usedLeaveDays : 0} Gün</span>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className="text-right">
                                <p className="text-[13px] font-bold text-slate-700">
                                   {new Date(req.startDate).toLocaleDateString('tr-TR')} - {new Date(req.endDate).toLocaleDateString('tr-TR')}
                                </p>
                                <p className="text-[11px] font-black text-blue-600 uppercase mt-0.5">{days} GÜN İZİN</p>
                             </div>
                             <div className="flex gap-2">
                                <button 
                                  onClick={() => onAction(req.id, 'REJECTED')}
                                  className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
                                >
                                   <X className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => onAction(req.id, 'APPROVED')}
                                  className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                                >
                                   <Check className="w-5 h-5" />
                                </button>
                             </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
          </div>
        </div>

        {/* Yan Panel Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
             <h3 className="font-black text-slate-800 text-sm mb-6 flex items-center gap-2 uppercase tracking-tighter">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Tim Verimliliği
             </h3>
             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Toplam İşlem</p>
                      <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Onay Oranı</p>
                      <p className="text-lg font-black text-emerald-600">%{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}</p>
                   </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                   <div className="bg-emerald-500 h-full" style={{ width: `${(stats.approved/stats.total)*100}%` }}></div>
                   <div className="bg-red-500 h-full" style={{ width: `${(stats.rejected/stats.total)*100}%` }}></div>
                </div>
             </div>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-100">
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg">
                   <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold">Önemli Hatırlatma</h3>
             </div>
             <p className="text-sm text-blue-100 leading-relaxed font-medium italic">
                "Kıdem önceliği sistemi, aynı tarih aralığına 3. bir personel başvurduğunda otomatik devreye girer. Yönetici olarak bu dengeyi manuel olarak da bozabilirsiniz."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
