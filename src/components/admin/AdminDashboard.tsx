import React from 'react';
import { Employee, AttendanceRecord, LeaveRequest, OfficeLocation } from '../../types';
import { getTodayDateString, formatDateIndo } from '../../utils/geoUtils';
import {
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Building2,
  MapPin,
  TrendingUp,
  UserCheck,
  Award,
} from 'lucide-react';

interface AdminDashboardProps {
  employees: Employee[];
  attendances: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  offices: OfficeLocation[];
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  employees,
  attendances,
  leaveRequests,
  offices,
  onNavigateTab,
}) => {
  const todayStr = getTodayDateString();

  // Today's records
  const todayRecords = attendances.filter((a) => a.date === todayStr);
  const totalEmployees = employees.filter((e) => e.status === 'Aktif').length;
  const totalHadirToday = todayRecords.filter((a) => a.checkInTime).length;
  const totalTepatWaktu = todayRecords.filter((a) => a.status === 'Tepat Waktu').length;
  const totalTerlambat = todayRecords.filter((a) => a.status === 'Terlambat').length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;

  const attendanceRate = totalEmployees > 0 ? Math.round((totalHadirToday / totalEmployees) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard Manajemen & Operasional</h2>
          <p className="text-xs text-slate-500">
            Monitoring kehadiran realtime, rekapitulasi lokasi GPS, dan permohonan persetujuan cuti.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            {formatDateIndo(todayStr)}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div
          onClick={() => onNavigateTab('karyawan')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Karyawan Aktif</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalEmployees} Orang</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tersebar di {offices.length} Lokasi Kantor</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('rekap')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Tingkat Kehadiran Hari Ini</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{attendanceRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>{totalHadirToday} dari {totalEmployees} karyawan sudah absen</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('rekap')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Tepat Waktu / Terlambat</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {totalTepatWaktu} / <span className="text-rose-600">{totalTerlambat}</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            <span>{totalTerlambat} Karyawan datang terlambat</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('approval')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">Pending Cuti / Izin</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{pendingLeaves} Permohonan</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            <span className="text-indigo-600 font-bold">Membutuhkan persetujuan atasan</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Live Today Attendance Log & Office Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Today Check-in Feed (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Presensi Hari Ini Realtime
            </h3>
            <span className="text-xs font-bold text-slate-500">{todayRecords.length} Terdata</span>
          </div>

          <div className="space-y-3">
            {todayRecords.length > 0 ? (
              todayRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={rec.checkInPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                      alt={rec.userName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{rec.userName}</p>
                      <p className="text-[10px] text-slate-500">{rec.userNip} • {rec.department}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-600">
                        <MapPin className="w-3 h-3 text-indigo-600" />
                        <span>{rec.officeName}</span>
                        {rec.checkInLocation && (
                          <span className="text-slate-400">({rec.checkInLocation.distanceMeters}m)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-800 text-xs">
                      {rec.checkInTime} WIB
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                        rec.status === 'Tepat Waktu'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada presensi masuk yang tercatat hari ini.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Office Locations Overview (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Lokasi Geofence Kantor
            </h3>
            <button
              onClick={() => onNavigateTab('lokasi')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Kelola Lokasi
            </button>
          </div>

          <div className="space-y-3">
            {offices.map((off) => (
              <div
                key={off.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{off.name}</span>
                  <span className="bg-indigo-100 text-indigo-800 font-bold text-[10px] px-2 py-0.5 rounded-md">
                    Radius {off.radiusMeters}m
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{off.address}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Koordinat GPS: {off.latitude.toFixed(4)}, {off.longitude.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
