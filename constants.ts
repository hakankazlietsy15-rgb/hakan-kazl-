
import { User } from './types';

export const MAX_LEAVE_DAYS_PER_REQUEST = 14;
export const TOTAL_ANNUAL_LEAVE = 24;
export const MAX_CONCURRENT_LEAVES = 2;

const PERSONNEL_DATA = [
  { name: "Murat TOPCU", sicil: "401017" }, // Yönetici olacak
  { name: "Yılmaz Salih ONAN", sicil: "422482" },
  { name: "Emre AKÇAKAYA", sicil: "427658" },
  { name: "Hamza KÜÇÜKŞAHİNER", sicil: "428167" },
  { name: "Barış YANBAŞ", sicil: "469940" },
  { name: "Alper KÜTÜK", sicil: "534287" },
  { name: "Tolga KARABOĞA", sicil: "482522" },
  { name: "Mustafa GÖKÇE", sicil: "521290" },
  { name: "Mertcan İLHAN", sicil: "471060" },
  { name: "Eray İhsan ÇALIŞKAN", sicil: "501994" },
  { name: "Mehmet Ali DÜNDAR", sicil: "436413" },
  { name: "Yunus Emre AKSÜT", sicil: "502205" },
  { name: "Ahmet Selim KUMLU", sicil: "491372" },
  { name: "Ali BEZİRGAN", sicil: "521379" },
  { name: "Mehmet TEMİZKAN", sicil: "523356" },
  { name: "Furkan Tayyip FURTANA", sicil: "529141" },
  { name: "Mehmet DEMİRTAŞ", sicil: "512992" },
  { name: "Erdem ÜNAL", sicil: "534818" },
  { name: "Mehmet KILIÇKIRAN", sicil: "498991" },
  { name: "Tolga ÖNEŞ", sicil: "535727" },
  { name: "Hakan KAZLI", sicil: "533638" },
  { name: "Murat ÖZKAN", sicil: "537170" },
  { name: "Mustafa KARINLI", sicil: "539876" },
  { name: "Mehmet Oğuz KÖKPINAR", sicil: "436467" }
];

export const INITIAL_USERS: User[] = PERSONNEL_DATA.map((p, index) => {
  const isMurat = p.sicil === "401017";
  return {
    id: `user-${index + 1}`,
    sicilNo: p.sicil,
    name: p.name,
    password: `${p.sicil}+`,
    yearsOfService: 1000000 - Number(p.sicil),
    role: isMurat ? 'ADMIN' : 'EMPLOYEE',
    totalLeaveEntitlement: TOTAL_ANNUAL_LEAVE,
    usedLeaveDays: 0
  };
});
