import React, { useState } from 'react';
import { Employee, Role, Religion, OfficeLocation } from '../../types';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ShieldCheck,
  UserCheck,
  User,
  Search,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  offices: OfficeLocation[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  offices,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('semua');
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState<Employee | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('081234567890');
  const [password, setPassword] = useState('123');
  const [role, setRole] = useState<Role>('karyawan');
  const [department, setDepartment] = useState('Technology & Engineering');
  const [position, setPosition] = useState('Software Engineer');
  const [religion, setReligion] = useState<Religion>('Islam');
  const [managerId, setManagerId] = useState('');
  const [officeLocationId, setOfficeLocationId] = useState(offices[0]?.id || '');
  const [annualQuota, setAnnualQuota] = useState(12);
  const [allowOutsideCheckIn, setAllowOutsideCheckIn] = useState<boolean>(false);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'semua' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openAddModal = () => {
    setEditingEmp(null);
    setName('');
    setNip(`NIP-2026-00${employees.length + 1}`);
    setEmail('');
    setPhone('');
    setPassword('123');
    setRole('karyawan');
    setDepartment('Technology & Engineering');
    setPosition('Software Engineer');
    setReligion('Islam');
    setManagerId('');
    setOfficeLocationId(offices[0]?.id || '');
    setAnnualQuota(12);
    setAllowOutsideCheckIn(false);
    setShowModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setNip(emp.nip);
    setEmail(emp.email);
    setPhone(emp.phone);
    setPassword(emp.password || '123');
    setRole(emp.role);
    setDepartment(emp.department);
    setPosition(emp.position);
    setReligion(emp.religion);
    setManagerId(emp.managerId || '');
    setOfficeLocationId(emp.officeLocationId);
    setAnnualQuota(emp.leaveQuota.annualTotal);
    setAllowOutsideCheckIn(emp.allowOutsideCheckIn || false);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEmp) {
      const updated: Employee = {
        ...editingEmp,
        name,
        nip,
        email,
        phone,
        password,
        role,
        department,
        position,
        religion,
        managerId: managerId || undefined,
        officeLocationId,
        allowOutsideCheckIn,
        leaveQuota: {
          ...editingEmp.leaveQuota,
          annualTotal: Number(annualQuota),
        },
      };
      onUpdateEmployee(updated);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        nip,
        name,
        email,
        phone: phone || '081234567890',
        password: password || '123',
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=250`,
        role,
        department,
        position,
        religion,
        managerId: managerId || undefined,
        officeLocationId,
        allowOutsideCheckIn,
        leaveQuota: {
          annualTotal: Number(annualQuota),
          annualUsed: 0,
          sickTotal: 10,
          sickUsed: 0,
          specialTotal: 5,
          specialUsed: 0,
        },
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Aktif',
      };
      onAddEmployee(newEmp);
    }

    setShowModal(false);
  };

  const approvers = employees.filter((e) => e.role === 'manager' || e.role === 'admin');

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Data Karyawan & Kelola Role</h2>
          <p className="text-xs text-slate-500">
            Tambah karyawan, atur role pimpinan/approver, departemen, dan lokasi kantor penugasan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Tambah Karyawan Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari NIP, nama, departemen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="semua">Semua Role</option>
            <option value="admin">Admin HR</option>
            <option value="manager">Manager / Approver</option>
            <option value="karyawan">Staf Karyawan</option>
          </select>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Role Akses</th>
                <th className="py-3 px-4">Departemen & Jabatan</th>
                <th className="py-3 px-4">Atasan Approver</th>
                <th className="py-3 px-4">Agama</th>
                <th className="py-3 px-4">Lokasi Kantor</th>
                <th className="py-3 px-4 text-center">Absen di Luar</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEmployees.map((emp) => {
                const manager = employees.find((e) => e.id === emp.managerId);
                const office = offices.find((o) => o.id === emp.officeLocationId);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">{emp.nip} • {emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          emp.role === 'admin'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : emp.role === 'manager'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {emp.role === 'admin' && <ShieldCheck className="w-3 h-3 text-amber-700" />}
                        {emp.role === 'manager' && <UserCheck className="w-3 h-3 text-indigo-700" />}
                        {emp.role === 'karyawan' && <User className="w-3 h-3 text-emerald-700" />}
                        {emp.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{emp.position}</p>
                      <p className="text-[10px] text-slate-500">{emp.department}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      {manager ? (
                        <div className="text-slate-800 font-medium">
                          <span className="font-semibold">{manager.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Direct HR</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {emp.religion}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {office ? office.name : 'Kantor Utama'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {emp.allowOutsideCheckIn ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Diizinkan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                          Wajib WFO
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Karyawan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmEmp(emp)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Karyawan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingEmp ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIP (Nomor Induk):</label>
                <input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Perusahaan:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / HP (Login):</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 083111222333"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi / Password Login:</label>
                <input
                  type="text"
                  required
                  placeholder="Password akun"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role & Hak Akses:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                >
                  <option value="karyawan">Staf Karyawan</option>
                  <option value="manager">Manager / Approver (Bisa Approve Cuti)</option>
                  <option value="admin">Admin HR (Akses Penuh)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Departemen:</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan:</label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Agama (Kategori Libur):</label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value as Religion)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Khonghucu">Khonghucu</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Atasan Direct (Approver):</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                >
                  <option value="">-- Tidak Ada Atasan Direct --</option>
                  {approvers.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Lokasi Kantor Wajib Absen:</label>
                <select
                  value={officeLocationId}
                  onChange={(e) => setOfficeLocationId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
                >
                  {offices.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} (Radius {off.radiusMeters}m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Kuota Cuti Tahunan (Hari):</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={annualQuota}
                  onChange={(e) => setAnnualQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-indigo-950 text-xs">Izin Absen di Luar Radius Kantor</span>
                  <span className="block text-[11px] text-indigo-700">Izinkan karyawan ini memilih mode "Absen di Luar" saat berada di luar radius geofence.</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowOutsideCheckIn}
                  onChange={(e) => setAllowOutsideCheckIn(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0 ml-3"
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
                Simpan Data Karyawan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Konfirmasi Hapus Karyawan</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900 text-sm">{deleteConfirmEmp.name}</p>
              <p className="text-slate-500 font-mono text-[11px]">NIP: {deleteConfirmEmp.nip}</p>
              <p className="text-slate-600 text-[11px]">{deleteConfirmEmp.position} • {deleteConfirmEmp.department}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmEmp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteEmployee(deleteConfirmEmp.id);
                  setDeleteConfirmEmp(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Ya, Hapus Karyawan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
