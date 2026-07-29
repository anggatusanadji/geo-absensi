import React, { useState } from 'react';
import { AttendanceRecord, Employee } from '../../types';
import { formatDateIndo } from '../../utils/geoUtils';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building2,
  Image,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';

interface AttendanceHistoryProps {
  currentUser: Employee;
  attendances: AttendanceRecord[];
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  currentUser,
  attendances,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Filter user's records
  const userRecords = attendances.filter((a) => a.userId === currentUser.id);

  const filteredRecords = userRecords.filter((rec) => {
    const matchesMonth = rec.date.startsWith(selectedMonth);
    const matchesStatus =
      selectedStatus === 'semua' || rec.status === selectedStatus;
    return matchesMonth && matchesStatus;
  });

  // Calculate statistics
  const totalHadir = filteredRecords.filter((r) => r.checkInTime).length;
  const totalTepatWaktu = filteredRecords.filter((r) => r.status === 'Tepat Waktu').length;
  const totalTerlambat = filteredRecords.filter((r) => r.status === 'Terlambat').length;

  return (
    <div className="space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Riwayat Kehadiran Saya</h2>
          <p className="text-xs text-slate-500">
            Daftar catatan presensi masuk, pulang, dan verifikasi titik koordinat GPS.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month picker */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          {/* Status picker */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Status</option>
              <option value="Tepat Waktu">Tepat Waktu</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Izin / Cuti">Izin / Cuti</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Kehadiran</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalHadir} Hari</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tepat Waktu</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{totalTepatWaktu} Hari</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Terlambat</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{totalTerlambat} Hari</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Jam Pulang</th>
                <th className="py-3 px-4">Mode / Lokasi</th>
                <th className="py-3 px-4">Verifikasi GPS</th>
                <th className="py-3 px-4">Foto Selfie</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {formatDateIndo(rec.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600">
                      {rec.checkInTime || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-600">
                      {rec.checkOutTime || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                        <Building2 className="w-3 h-3 text-indigo-600" />
                        {rec.workType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.checkInLocation ? (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[140px]">{rec.officeName}</span>
                          <span className="text-[10px] text-slate-400">({rec.checkInLocation.distanceMeters}m)</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.checkInPhoto ? (
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto(rec.checkInPhoto!)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-[11px] bg-indigo-50 px-2 py-1 rounded-lg transition"
                        >
                          <Image className="w-3.5 h-3.5" /> Lihat Foto
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          rec.status === 'Tepat Waktu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Terlambat'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada catatan presensi untuk periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Modal Preview */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">Foto Verifikasi Absensi</h4>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewPhoto}
              alt="Bukti Selfie"
              className="w-full aspect-square object-cover rounded-2xl border border-slate-200"
            />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
