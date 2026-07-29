import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Employee,
  OfficeLocation,
  AttendanceRecord,
  WorkType,
} from '../../types';
import { GeofenceMap } from '../GeofenceMap';
import { CameraSelfie } from '../CameraSelfie';
import {
  calculateDistanceMeters,
  getTodayDateString,
  getCurrentTimeString,
  formatDateIndo,
} from '../../utils/geoUtils';
import {
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Briefcase,
  Navigation,
  Camera,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface AttendanceCheckInProps {
  currentUser: Employee;
  offices: OfficeLocation[];
  attendances: AttendanceRecord[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
}

export const AttendanceCheckIn: React.FC<AttendanceCheckInProps> = ({
  currentUser,
  offices,
  attendances,
  onAddAttendance,
  onUpdateAttendance,
}) => {
  // Find assigned office or default to first
  const initialOffice =
    offices.find((o) => o.id === currentUser.officeLocationId) || offices[0];
  const [selectedOffice, setSelectedOffice] = useState<OfficeLocation>(initialOffice);

  // User GPS position
  const [userLat, setUserLat] = useState<number>(selectedOffice.latitude);
  const [userLng, setUserLng] = useState<number>(selectedOffice.longitude);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Attendance state
  const [workType, setWorkType] = useState<WorkType>('WFO');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Calculate distance
  const distance = calculateDistanceMeters(
    userLat,
    userLng,
    selectedOffice.latitude,
    selectedOffice.longitude
  );

  // Absensi membutuhkan lokasi berada di dalam radius kantor (Geofence)
  const isInsideRadius = distance <= selectedOffice.radiusMeters;
  const hasOutsidePermission = Boolean(currentUser.allowOutsideCheckIn);
  const isOutsideMode = workType === 'Absen di Luar';
  
  // Validasi lokasi berdasarkan mode kerja dan izin pengguna
  const isLocationValid = isOutsideMode ? (hasOutsidePermission || isInsideRadius) : isInsideRadius;
  const canCheckIn = isLocationValid;

  // Check if user already checked in today
  const todayStr = getTodayDateString();
  const todayRecord = attendances.find(
    (a) => a.userId === currentUser.id && a.date === todayStr
  );

  // Request GPS
  const handleGetRealGps = () => {
    setIsGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Browser atau HP Anda tidak mendukung fitur Geolocation GPS.');
      setIsGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setIsGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        let msg = 'Gagal mengambil lokasi GPS Anda.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Izin lokasi/GPS ditolak. Mohon aktifkan izin GPS pada browser/HP Anda.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Sinyal GPS tidak tersedia. Pastikan lokasi HP Anda aktif.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Waktu permintaan GPS habis. Silakan klik tombol perbarui lokasi.';
        }
        setGpsError(msg);
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Auto get real GPS on mount and on office selection change
  useEffect(() => {
    handleGetRealGps();
  }, [selectedOffice.id]);

  // Check-In Handler
  const handleCheckIn = () => {
    if (!photoDataUrl) {
      alert('Gagal Absen: Mohon mengambil foto selfie terlebih dahulu sebelum absen.');
      return;
    }

    if (!isLocationValid) {
      if (isOutsideMode && !hasOutsidePermission) {
        alert(`Gagal Absen: Akun Anda tidak memiliki izin untuk Absen di Luar dari Admin. Silakan hubungi Admin HR untuk memberikan izin akses.`);
      } else {
        alert(`Gagal Absen: Anda berada di luar radius lokasi ${selectedOffice.name} (${distance}m dari batas ${selectedOffice.radiusMeters}m). Absensi tidak dapat dilakukan.`);
      }
      return;
    }

    const currentTime = getCurrentTimeString();
    // Compare time with workStart (e.g. 08:00)
    const isLate = currentTime > `${selectedOffice.workStart}:00`;
    const status = isLate ? 'Terlambat' : 'Tepat Waktu';

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userNip: currentUser.nip,
      department: currentUser.department,
      date: todayStr,
      checkInTime: currentTime,
      checkInLocation: {
        lat: userLat,
        lng: userLng,
        addressName: selectedOffice.name,
        distanceMeters: distance,
        insideRadius: isInsideRadius,
      },
      checkInPhoto: photoDataUrl || currentUser.avatar,
      status: status,
      workType: workType,
      officeLocationId: selectedOffice.id,
      officeName: selectedOffice.name,
      notes: notes || `Absen Masuk via GPS (${workType})`,
    };

    onAddAttendance(newRecord);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Check-Out Handler
  const handleCheckOut = () => {
    if (!todayRecord) return;

    if (!photoDataUrl) {
      alert('Gagal Absen Pulang: Mohon mengambil foto selfie terlebih dahulu.');
      return;
    }

    if (!isLocationValid) {
      if (isOutsideMode && !hasOutsidePermission) {
        alert(`Gagal Absen Pulang: Akun Anda tidak memiliki izin untuk Absen di Luar dari Admin.`);
      } else {
        alert(`Gagal Absen Pulang: Anda berada di luar radius lokasi ${selectedOffice.name} (${distance}m dari batas ${selectedOffice.radiusMeters}m). Absen pulang tidak dapat dilakukan.`);
      }
      return;
    }

    const currentTime = getCurrentTimeString();
    const updatedRecord: AttendanceRecord = {
      ...todayRecord,
      checkOutTime: currentTime,
      checkOutLocation: {
        lat: userLat,
        lng: userLng,
        addressName: selectedOffice.name,
        distanceMeters: distance,
        insideRadius: isInsideRadius,
      },
      checkOutPhoto: photoDataUrl || todayRecord.checkInPhoto,
      notes: todayRecord.notes + ` | Absen Pulang: ${currentTime}`,
    };

    onUpdateAttendance(updatedRecord);

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                Verifikasi Presensi GPS Geofencing
              </span>
              <span className="text-xs text-slate-300">{formatDateIndo(todayStr)}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Selamat Datang, {currentUser.name}!</h2>
            <p className="text-xs text-slate-300 mt-1">
              NIP: <span className="font-mono text-indigo-300 font-semibold">{currentUser.nip}</span> • {currentUser.department}
            </p>
          </div>

          {/* Quick Today's Status Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center gap-4 text-xs">
            <div>
              <div className="text-slate-300 text-[10px]">Absen Masuk</div>
              <div className="font-bold text-sm text-emerald-400">
                {todayRecord?.checkInTime || '--:--:--'}
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-slate-300 text-[10px]">Absen Pulang</div>
              <div className="font-bold text-sm text-amber-300">
                {todayRecord?.checkOutTime || '--:--:--'}
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-slate-300 text-[10px]">Status Presensi</div>
              <div className="font-bold text-xs text-white">
                {todayRecord ? (
                  <span className={todayRecord.status === 'Tepat Waktu' ? 'text-emerald-300' : 'text-amber-300'}>
                    {todayRecord.status}
                  </span>
                ) : (
                  'Belum Absen'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Map & GPS Geofence | Right Check-in Actions & Selfie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Map & Location Selector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Lokasi Kantor Absensi</h3>
              </div>

              {/* Office Selector */}
              <select
                value={selectedOffice.id}
                onChange={(e) => {
                  const off = offices.find((o) => o.id === e.target.value);
                  if (off) {
                    setSelectedOffice(off);
                    setUserLat(off.latitude + 0.00012);
                    setUserLng(off.longitude + 0.00012);
                  }
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {offices.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.name} ({off.radiusMeters}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Address Banner */}
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">{selectedOffice.name}</p>
                <p className="text-[11px] text-slate-500">{selectedOffice.address}</p>
                <p className="text-[11px] text-indigo-700 font-medium mt-1">
                  Jam Kerja: {selectedOffice.workStart} - {selectedOffice.workEnd} WIB • Toleransi Radius: {selectedOffice.radiusMeters} meter
                </p>
              </div>
            </div>

            {/* Geofence Map */}
            <GeofenceMap
              office={selectedOffice}
              userLat={userLat}
              userLng={userLng}
              distanceMeters={distance}
              isInside={isInsideRadius}
            />

            {/* Real GPS Controls */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleGetRealGps}
                  disabled={isGpsLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Navigation className={`w-4 h-4 ${isGpsLoading ? 'animate-spin' : ''}`} />
                  {isGpsLoading ? 'Memperbarui GPS...' : 'Perbarui Lokasi GPS HP'}
                </button>

                <span className="text-[11px] font-medium text-slate-500">
                  GPS Asli Perangkat
                </span>
              </div>

              {gpsError && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> {gpsError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Verification & Action Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Verifikasi Presensi & Foto</h3>
              </div>
              <span className="text-[11px] text-slate-500">Formulir Absensi Realtime</span>
            </div>

            {/* Work Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tipe Kehadiran / Mode Kerja:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkType('WFO')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                    workType === 'WFO'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  WFO (Kantor)
                </button>

                <button
                  type="button"
                  onClick={() => setWorkType('Absen di Luar')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition ${
                    workType === 'Absen di Luar'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mb-1" />
                  Absen di Luar
                </button>
              </div>
            </div>

            {/* Geofence Status Alert Banner */}
            {isOutsideMode ? (
              hasOutsidePermission ? (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-start gap-2.5 text-indigo-900 text-xs">
                  <Briefcase className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Izin Absen di Luar Aktif</p>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Akun Anda memiliki izin khusus dari Admin HR untuk melakukan absen di luar radius kantor ({distance}m dari {selectedOffice.name}).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 text-xs">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">AKUN TIDAK MEMILIKI IZIN ABSEN DI LUAR</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Izin "Absen di Luar" belum diaktifkan oleh Admin HR untuk akun Anda. Anda wajib berada di dalam radius kantor ({selectedOffice.radiusMeters}m) untuk dapat absen.
                    </p>
                  </div>
                </div>
              )
            ) : isInsideRadius ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">GPS Terverifikasi Valid (WFO)</p>
                  <p className="text-[11px] text-emerald-700">
                    Anda berada {distance} meter dari {selectedOffice.name} (Batas: {selectedOffice.radiusMeters}m). Silakan ambil foto selfie di bawah.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-rose-800 text-xs">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900">TIDAK BISA ABSEN: DI LUAR RADIUS!</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Jarak Anda saat ini: <strong className="font-bold">{distance} meter</strong> dari {selectedOffice.name} (Maksimal: {selectedOffice.radiusMeters}m). Anda tidak dapat melakukan absen sama sekali di luar radius.
                  </p>
                </div>
              </div>
            )}

            {/* Selfie Camera Capture Widget */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Ambil Foto Selfie Presensi:
              </label>
              <CameraSelfie onCapture={(dataUrl) => setPhotoDataUrl(dataUrl)} />
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Catatan Tambahan (Opsional):
              </label>
              <input
                type="text"
                placeholder="Contoh: Kunjungan lokasi / meeting..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action Buttons: Check-In or Check-Out */}
            <div className="pt-2 border-t border-slate-100">
              {!photoDataUrl ? (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-center space-y-1.5">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 text-amber-800 mb-1">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-amber-900 text-xs">Ambil Foto Selfie Terlebih Dahulu</p>
                  <p className="text-[11px] text-amber-700">
                    Tombol Absen akan otomatis muncul setelah Anda mengambil foto selfie verifikasi di atas.
                  </p>
                </div>
              ) : !todayRecord ? (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={!isLocationValid}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition ${
                    isLocationValid
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                      : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {isLocationValid
                    ? `ABSEN MASUK SEKARANG (${workType})`
                    : isOutsideMode && !hasOutsidePermission
                    ? 'ABSEN DITOLAK (TANPA IZIN ABSEN LUAR)'
                    : 'ABSEN DITOLAK (DI LUAR RADIUS)'}
                </button>
              ) : !todayRecord.checkOutTime ? (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold">Sudah Absen Masuk: </span>
                      <span>{todayRecord.checkInTime} WIB ({todayRecord.workType})</span>
                    </div>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {todayRecord.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckOut}
                    disabled={!isLocationValid}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition ${
                      isLocationValid
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                        : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    {isLocationValid
                      ? 'ABSEN PULANG SEKARANG'
                      : isOutsideMode && !hasOutsidePermission
                      ? 'ABSEN PULANG DITOLAK (TANPA IZIN ABSEN LUAR)'
                      : 'ABSEN PULANG DITOLAK (DI LUAR RADIUS)'}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-center space-y-1">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mb-1">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Presensi Hari Ini Selesai</h4>
                  <p className="text-xs text-slate-500">
                    Masuk: {todayRecord.checkInTime} WIB • Pulang: {todayRecord.checkOutTime} WIB
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
