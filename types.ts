
export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  sicilNo: string;
  name: string;
  password: string;
  yearsOfService: number;
  role: Role;
  totalLeaveEntitlement: number; // Toplam hak (24)
  usedLeaveDays: number; // Kullanılan miktar
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  rejectionReason?: string;
  seniorityAtRequest: number;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  requests: LeaveRequest[];
}
