import React, { useState } from 'react';
import { Holiday, Religion, Employee } from '../../types';
import { formatDateIndo } from '../../utils/geoUtils';
import {
  Calendar,
  Plus,
  Trash2,
  Users,
  HeartHandshake,
  UserCheck,
  X,
  Check,
} from 'lucide-react';

interface HolidayManagementProps {
  holidays: Holiday[];
  employees: Employee[];
  onAddHoliday: (holiday: Holiday) => void;
  onDeleteHoliday: (id: string) => void;
}

export const HolidayManagement: React.FC<HolidayManagementProps> = ({
  holidays,
  employees,
  onAddHoliday,
  onDeleteHoliday,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmHoliday, setDeleteConfirmHoliday] = useState<Holiday | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'semua' | 'agama' | 'tertentu'>('semua');
  const [targetReligion, setTargetReligion] = useState<Religion>('Islam');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newHoliday: Holiday = {
      id: `hol-${Date.now()}`,
      title,
      date,
      type,
      targetReligion: type === 'agama' ? targetReligion : undefined,
      targetUserIds: type === 'tertentu' ? selectedUserIds : undefined,
      description,
    };

    onAddHoliday(newHoliday);
    setShowModal(false);
    setTitle('');
    setDate('');
    setDescription('');
    setSelectedUserIds([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Hari Libur Karyawan</h2>
          <p className="text-xs text-slate-500">
            Atur hari libur nasional untuk semua karyawan, libur khusus agama, atau libur karyawan tertentu.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah Hari Libur
        </button>
      </div>

      {/* Holidays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map((hol) => (
          <div
            key={hol.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      hol.type === 'semua'
                        ? 'bg-blue-100 text-blue-800'
                        : hol.type === 'agama'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {hol.type === 'semua' && 'Semua Karyawan (Nasional)'}
                    {hol.type === 'agama' && `Berdasarkan Agama: ${hol.targetReligion}`}
                    {hol.type === 'tertentu' && 'Karyawan Tertentu'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{hol.title}</h3>
                </div>

                <button
                  onClick={() => setDeleteConfirmHoliday(hol)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                  title="Hapus Hari Libur"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">{hol.description || 'Tidak ada catatan'}</p>

              {hol.type === 'tertentu' && hol.targetUserIds && (
                <div className="pt-2 text-[11px] text-slate-600">
                  <span className="font-semibold block">Karyawan Yang Berhak:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hol.targetUserIds.map((uid) => {
                      const emp = employees.find((e) => e.id === uid);
                      return (
                        <span key={uid} className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {emp ? emp.name : uid}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-700 font-bold font-mono">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{formatDateIndo(hol.date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Holiday Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Hari Libur Karyawan</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Hari Libur:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hari Raya Idul Fitri 1447 H"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Libur:</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori / Target Libur:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'semua' | 'agama' | 'tertentu')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                >
                  <option value="semua">Semua Karyawan (Nasional / Perusahaan)</option>
                  <option value="agama">Berdasarkan Agama (Khusus Agama Tertentu)</option>
                  <option value="tertentu">Karyawan Tertentu (Pilih Spesifik)</option>
                </select>
              </div>

              {type === 'agama' && (
                <div>
                  <label className="block font-bold text-amber-800 mb-1">Pilih Agama Target:</label>
                  <select
                    value={targetReligion}
                    onChange={(e) => setTargetReligion(e.target.value as Religion)}
                    className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>
              )}

              {type === 'tertentu' && (
                <div>
                  <label className="block font-bold text-purple-800 mb-1">Pilih Karyawan Spesifik:</label>
                  <div className="max-h-40 overflow-y-auto border border-purple-200 bg-purple-50/50 rounded-xl p-2 space-y-1">
                    {employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer text-xs font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(emp.id)}
                          onChange={() => handleToggleUser(emp.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{emp.name} ({emp.department})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Deskripsi:</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Simpan Hari Libur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmHoliday && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Konfirmasi Hapus Hari Libur</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900 text-sm">{deleteConfirmHoliday.title}</p>
              <p className="text-slate-500 text-[11px] font-mono">{formatDateIndo(deleteConfirmHoliday.date)}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmHoliday(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteHoliday(deleteConfirmHoliday.id);
                  setDeleteConfirmHoliday(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Ya, Hapus Libur
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
