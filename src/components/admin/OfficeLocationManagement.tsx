import React, { useState } from 'react';
import { OfficeLocation } from '../../types';
import { GeofenceMap } from '../GeofenceMap';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Compass,
  X,
  Check,
} from 'lucide-react';

interface OfficeLocationManagementProps {
  offices: OfficeLocation[];
  onAddOffice: (office: OfficeLocation) => void;
  onUpdateOffice: (office: OfficeLocation) => void;
  onDeleteOffice: (id: string) => void;
}

export const OfficeLocationManagement: React.FC<OfficeLocationManagementProps> = ({
  offices,
  onAddOffice,
  onUpdateOffice,
  onDeleteOffice,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<OfficeLocation | null>(null);
  const [deleteConfirmOffice, setDeleteConfirmOffice] = useState<OfficeLocation | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(-6.2088);
  const [longitude, setLongitude] = useState(106.8456);
  const [radiusMeters, setRadiusMeters] = useState(150);
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('17:00');

  const openAddModal = () => {
    setEditingOffice(null);
    setName('');
    setAddress('');
    setLatitude(-6.2088);
    setLongitude(106.8456);
    setRadiusMeters(150);
    setWorkStart('08:00');
    setWorkEnd('17:00');
    setShowModal(true);
  };

  const openEditModal = (off: OfficeLocation) => {
    setEditingOffice(off);
    setName(off.name);
    setAddress(off.address);
    setLatitude(off.latitude);
    setLongitude(off.longitude);
    setRadiusMeters(off.radiusMeters);
    setWorkStart(off.workStart);
    setWorkEnd(off.workEnd);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingOffice) {
      const updated: OfficeLocation = {
        ...editingOffice,
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radiusMeters: Number(radiusMeters),
        workStart,
        workEnd,
      };
      onUpdateOffice(updated);
    } else {
      const newOff: OfficeLocation = {
        id: `off-${Date.now()}`,
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radiusMeters: Number(radiusMeters),
        workStart,
        workEnd,
        isActive: true,
      };
      onAddOffice(newOff);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengaturan Lokasi Kantor & Geofence GPS</h2>
          <p className="text-xs text-slate-500">
            Tentukan koordinat lokasi kantor utama & cabang serta batas radius toleransi presensi karyawan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah Lokasi Kantor
        </button>
      </div>

      {/* Office Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {offices.map((off) => (
          <div
            key={off.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{off.name}</h3>
                    <span className="inline-block mt-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Radius: {off.radiusMeters} Meter
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-600 leading-snug">{off.address}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Jam Kerja Wajib: {off.workStart} - {off.workEnd} WIB</span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-50 p-2 rounded-xl">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lat: {off.latitude.toFixed(6)}, Lng: {off.longitude.toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(off)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => setDeleteConfirmOffice(off)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit Office */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingOffice ? 'Edit Lokasi Kantor' : 'Tambah Lokasi Kantor Baru'}
              </h3>
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
                <label className="block font-bold text-slate-700 mb-1">Nama Lokasi Kantor:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kantor Cabang Bandung"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap:</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Asia Afrika No. 12, Bandung..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude:</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude:</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Radius Geofence (Meter):</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={1000}
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Masuk (Start):</label>
                  <input
                    type="time"
                    required
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Pulang (End):</label>
                  <input
                    type="time"
                    required
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Interactive Map Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Koordinat Pada Peta (Klik Pada Peta):
                </label>
                <GeofenceMap
                  office={{
                    id: 'temp',
                    name: name || 'Lokasi Pilihan',
                    address,
                    latitude: Number(latitude),
                    longitude: Number(longitude),
                    radiusMeters: Number(radiusMeters),
                    workStart,
                    workEnd,
                    isActive: true,
                  }}
                  userLat={Number(latitude)}
                  userLng={Number(longitude)}
                  distanceMeters={0}
                  isInside={true}
                  interactiveSelect={true}
                  onSelectCoordinates={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
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
                Simpan Lokasi Kantor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOffice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Konfirmasi Hapus Lokasi Kantor</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900 text-sm">{deleteConfirmOffice.name}</p>
              <p className="text-slate-500 text-[11px]">{deleteConfirmOffice.address}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOffice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOffice(deleteConfirmOffice.id);
                  setDeleteConfirmOffice(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Ya, Hapus Lokasi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
