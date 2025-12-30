
import React, { useState, useMemo, useRef } from 'react';
import { User, LeaveRequest } from '../types';
import { calculateDays, checkOverlaps } from '../utils';
import { MAX_LEAVE_DAYS_PER_REQUEST } from '../constants';
import { 
  CalendarPlus, 
  Info, 
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  PieChart,
  CalendarDays,
  ChevronRight
} from 'lucide-react';

interface EmployeeDashboardProps {
  user: User;
  requests: LeaveRequest[];
  onAddRequest: (req: LeaveRequest) => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, requests, onAddRequest }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const myRequests = requests.filter(r => r.userId === user.id);
  const remainingLeave = user.totalLeaveEntitlement - user.usedLeaveDays;

  // Bugünün tarihini YYYY-MM-DD formatında al
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini seçiniz.');
      return;
    }

    if (startDate < todayStr) {
      setError('Geçmiş tarihler için izin başvurusu yapılamaz.');
      return;
    }

    if (endDate < startDate) {
      setError('Bitiş tarihi başlangıç tarihinden önce olamaz.');
      return;
    }

    const totalDays = calculateDays(startDate, endDate);
    
    if (totalDays > MAX_LEAVE_DAYS_PER_REQUEST) {
      setError(`Tek seferde maksimum ${MAX_LEAVE_DAYS_PER_REQUEST} gün izin alabilirsiniz. Sizin talebiniz: ${totalDays} gün.`);
      return;
    }

    if (totalDays > remainingLeave) {
      setError(`Yetersiz izin bakiyesi. Kalan hakkınız: ${remainingLeave} gün.`);
      return;
    }

    const overlaps = checkOverlaps(startDate, endDate, requests);
    if (overlaps.length >= 2) {
      const sortedOverlaps = [...overlaps].sort((a, b) => a.seniorityAtRequest - b.seniorityAtRequest);
      const lowestSeniorityInSlot = sortedOverlaps[0].seniorityAtRequest;

      if (user.yearsOfService <= lowestSeniorityInSlot) {
        setError('SİCİLİN YETMEDİ (Aynı tarih aralığında daha düşük sicilli personel başvurusu mevcut).');
        return;
      }
    }

    const newRequest: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      startDate,
      endDate,
      status: 'PENDING',
      seniorityAtRequest: user.yearsOfService,
      createdAt: new Date().toISOString()
    };

    onAddRequest(newRequest);
    setSuccess('İzin talebiniz başarıyla oluşturuldu ve TİM ŞEFİ: Murat TOPCU onayına sunuldu.');
    setStartDate('');
    setEndDate('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3"/> Onaylandı</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-[10px] font-bold uppercase"><XCircle className="w-3 h-3"/> Reddedildi</span>;
      default:
        return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-[10px] font-bold uppercase"><Timer className="w-3 h-3"/> Beklemede</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="lg:col-span-1 space-y-6">
        {/* Bakiye Kartı */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                     <PieChart className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-slate-800">İzin Bakiyesi</h3>
                 </div>
                 <span className="text-2xl font-black text-indigo-600 tabular-nums">{remainingLeave} GÜN</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-3">
                 <div 
                   className="bg-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm" 
                   style={{ width: `${(remainingLeave / user.totalLeaveEntitlement) * 100}%` }}
                 ></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>KULLANILAN: {user.usedLeaveDays} GÜN</span>
                <span>TOPLAM: {user.totalLeaveEntitlement} GÜN</span>
              </div>
           </div>
        </div>

        {/* Yeni Talep Formu */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <CalendarPlus className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold">Yeni Başvuru</h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm flex items-start gap-3 animate-bounce-subtle">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="font-medium">{success}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Başlangıç Tarihi Alanı */}
              <div className="relative group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">İzin Başlangıç Tarihi</label>
                <div className="relative flex items-center gap-4 px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl group-hover:border-blue-400 transition-all overflow-hidden">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-slate-900">
                      {startDate ? new Date(startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Takvimi Aç'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  
                  {/* Gerçek Takvim Inputu - index.html'deki CSS ile tüm kutuyu kaplar */}
                  <input 
                    type="date" 
                    value={startDate}
                    min={todayStr}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Bitiş Tarihi Alanı */}
              <div className="relative group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">İzin Bitiş Tarihi</label>
                <div className={`relative flex items-center gap-4 px-4 py-4 border-2 rounded-2xl transition-all overflow-hidden ${startDate ? 'bg-slate-50 border-slate-100 group-hover:border-blue-400' : 'bg-slate-100 border-transparent opacity-50'}`}>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-slate-900">
                      {endDate ? new Date(endDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Takvimi Aç'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />

                  {/* Gerçek Takvim Inputu */}
                  {startDate && (
                    <input 
                      type="date" 
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-[11px] font-bold text-blue-700 uppercase">Bilgi</span>
              </div>
              <ul className="text-[11px] text-blue-600 space-y-1.5 font-medium">
                <li>• Kutunun herhangi bir yerine dokunarak takvimi açın.</li>
                <li>• Geçmişe dönük seçimler otomatik olarak engellenir.</li>
                <li>• Tek seferde maksimum 14 gün talep edilebilir.</li>
              </ul>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Başvuruyu Onaya Gönder</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                Geçmiş Başvurularım
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5 tracking-tight uppercase">TÜM KAYITLARINIZ BURADA LİSTELENİR</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-sm font-black text-blue-600">{myRequests.length} <span className="text-slate-400">TALEP</span></span>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tarih Aralığı</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Süre</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Durum</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Yönetici Notu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <div className="max-w-xs mx-auto flex flex-col items-center gap-4 text-slate-300">
                        <div className="bg-slate-50 p-6 rounded-full">
                          <CalendarIcon className="w-12 h-12 stroke-[1px]" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">Henüz bir izin talebiniz bulunmamaktadır.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  myRequests.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {new Date(req.startDate).toLocaleDateString('tr-TR')} - {new Date(req.endDate).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-bold">TALEP TARİHİ: {new Date(req.createdAt).toLocaleString('tr-TR')}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[12px] font-black">
                          {calculateDays(req.startDate, req.endDate)} GÜN
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-8 py-6 text-[11px] text-slate-500 font-medium max-w-[200px] leading-relaxed italic">
                        {req.rejectionReason || '---'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
