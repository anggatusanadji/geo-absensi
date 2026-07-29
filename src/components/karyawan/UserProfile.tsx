import React from 'react';
import { Employee, Holiday, OfficeLocation } from '../../types';
import { formatDateIndo } from '../../utils/geoUtils';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  MapPin,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

interface UserProfileProps {
  currentUser: Employee;
  holidays: Holiday[];
  offices: OfficeLocation[];
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  holidays,
  offices,
}) => {
  const assignedOffice = offices.find((o) => o.id === currentUser.officeLocationId);

  // Filter holidays applicable to this employee (Semua, matches employee religion, or matches employee ID)
  const myHolidays = holidays.filter((h) => {
    if (h.type === 'semua') return true;
    if (h.type === 'agama' && h.targetReligion === currentUser.religion) return true;
    if (h.type === 'tertentu' && h.targetUserIds?.includes(currentUser.id)) return true;
    return false;
  });

  const quota = currentUser.leaveQuota;
  const sisaCuti = quota.annualTotal - quota.annualUsed;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Profil Karyawan & Kalender Libur</h2>
        <p className="text-xs text-slate-500">
          Informasi identitas resmi, lokasi penugasan kantor, dan daftar hari libur agama & nasional Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Profile Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6 text-center sm:text-left">
            
            {/* Avatar & Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
              />
              <div>
                <h3 className="text-lg font-black text-slate-900">{currentUser.name}</h3>
                <p className="text-xs font-semibold text-indigo-600">{currentUser.position}</p>
                <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    {currentUser.nip}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {currentUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Info Items Grid */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3 text-slate-700">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Departemen:</span>
                  <span className="font-semibold text-slate-800">{currentUser.department}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Agama (Kategori Libur Keagamaan):</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    {currentUser.religion}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Kantor Penugasan Absensi:</span>
                  <span className="font-semibold text-slate-800">
                    {assignedOffice ? assignedOffice.name : 'Kantor Pusat'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Email Perusahaan:</span>
                  <span className="font-semibold text-slate-800">{currentUser.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Nomor HP / WhatsApp:</span>
                  <span className="font-semibold text-slate-800">{currentUser.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Tanggal Bergabung (Join Date):</span>
                  <span className="font-semibold text-slate-800">{formatDateIndo(currentUser.joinDate)}</span>
                </div>
              </div>
            </div>

            {/* Quota Summary Box */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl text-white space-y-2 text-left shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-200">Sisa Kuota Cuti Tahunan</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">
                {sisaCuti} <span className="text-xs font-normal text-slate-300">/ {quota.annualTotal} Hari</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(sisaCuti / quota.annualTotal) * 100}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Personalized Holiday Calendar (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Kalender Hari Libur Anda</h3>
              </div>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                Personalized ({currentUser.religion})
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Daftar hari libur berikut disesuaikan secara otomatis berdasarkan status keagamaan ({currentUser.religion}) dan kebijakan perusahaan.
            </p>

            <div className="space-y-3">
              {myHolidays.length > 0 ? (
                myHolidays.map((hol) => (
                  <div
                    key={hol.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{hol.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            hol.type === 'semua'
                              ? 'bg-blue-100 text-blue-800'
                              : hol.type === 'agama'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {hol.type === 'semua'
                            ? 'Libur Nasional / Semua'
                            : hol.type === 'agama'
                            ? `Khusus Umat ${hol.targetReligion}`
                            : 'Libur Karyawan Khusus'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{hol.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold font-mono text-indigo-600">
                        {formatDateIndo(hol.date)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada jadwal hari libur terdaftar.
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
