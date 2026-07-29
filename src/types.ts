export type Role = 'admin' | 'manager' | 'karyawan';

export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu' | 'Lainnya';

export type LeaveType = 'Cuti Tahunan' | 'Izin Sakit' | 'Izin Khusus' | 'Cuti Melahirkan' | 'Lainnya';

export type LeaveStatus = 'Pending' | 'Disetujui' | 'Ditolak';

export type AttendanceStatus = 'Tepat Waktu' | 'Terlambat' | 'Pulang Cepat' | 'Izin / Cuti' | 'Alpha';

export type WorkType = 'WFO' | 'Absen di Luar' | 'WFH' | 'Dinas Luar';

export interface LeaveQuota {
  annualTotal: number;
  annualUsed: number;
  sickTotal: number;
  sickUsed: number;
  specialTotal: number;
  specialUsed: number;
}

export interface Employee {
  id: string;
  nip: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  department: string;
  position: string;
  religion: Religion;
  managerId?: string; // Approver ID
  officeLocationId: string;
  leaveQuota: LeaveQuota;
  joinDate: string;
  phone: string;
  password?: string;
  status: 'Aktif' | 'Non-Aktif';
  allowOutsideCheckIn?: boolean; // Izin khusus untuk absen di luar radius
}

export interface OfficeLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // Geofence radius in meters
  workStart: string; // e.g. "08:00"
  workEnd: string;   // e.g. "17:00"
  isActive: boolean;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  addressName?: string;
  accuracyMeters?: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkInLocation?: {
    lat: number;
    lng: number;
    addressName: string;
    distanceMeters: number;
    insideRadius: boolean;
  };
  checkInPhoto?: string;
  checkOutTime?: string;
  checkOutLocation?: {
    lat: number;
    lng: number;
    addressName: string;
    distanceMeters: number;
    insideRadius: boolean;
  };
  checkOutPhoto?: string;
  status: AttendanceStatus;
  workType: WorkType;
  officeLocationId: string;
  officeName: string;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  department: string;
  approverId: string;
  approverName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  documentUrl?: string;
  status: LeaveStatus;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface Holiday {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'semua' | 'agama' | 'tertentu';
  targetReligion?: Religion;
  targetUserIds?: string[]; // Array of employee IDs if 'tertentu'
  description?: string;
}
