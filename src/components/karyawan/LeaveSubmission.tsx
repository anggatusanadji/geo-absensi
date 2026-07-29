import React, { useState } from 'react';
import { Employee, LeaveRequest, LeaveType } from '../../types';
import {
  calculateDaysBetween,
  formatDateIndo,
  formatShortDateIndo,
} from '../../utils/geoUtils';
import {
  CalendarDays,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  PlusCircle,
  Sparkles,
  AlertCircle,
  Send,
} from 'lucide-react';

interface LeaveSubmissionProps {
  currentUser: Employee;
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onSubmitLeave: (req: LeaveRequest) => void;
}

export const LeaveSubmission: React.FC<LeaveSubmissionProps> = ({
  currentUser,
  employees,
  leaveRequests,
  onSubmitLeave,
}) => {
  const [showForm, setShowForm] = useState(false);

  // Eligible approvers (Managers and Admins)
  const approvers = employees.filter(
    (e) => e.role === 'manager' || e.role === 'admin'
  );

  // Default approver: assigned manager or first manager
  const defaultApproverId =
    currentUser.managerId || approvers[0]?.id || '';

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Cuti Tahunan');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [approverId, setApproverId] = useState<string>(defaultApproverId);
  const [reason, setReason] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');

  // Calculate days
  const duration =
    startDate && endDate ? calculateDaysBetween(startDate, endDate) : 1;

  // Realtime Quota Balances
  const quota = currentUser.leaveQuota;
  const sisaCutiTahunan = quota.annualTotal - quota.annualUsed;
  const sisaIzinSakit = quota.sickTotal - quota.sickUsed;
  const sisaIzinKhusus = quota.specialTotal - quota.specialUsed;

  // Filter requests submitted by this employee
  const myRequests = leaveRequests.filter((r) => r.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      alert('Mohon isi tanggal mulai dan tanggal selesai cuti.');
      return;
    }

    if (leaveType === 'Cuti Tahunan' && duration > sisaCutiTahunan) {
      alert(`Permohonan cuti (${duration} hari) melebihi sisa kuota cuti tahunan Anda (${sisaCutiTahunan} hari).`);
      return;
    }

    const targetApprover = employees.find((e) => e.id === approverId);

    const newReq: LeaveRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userNip: currentUser.nip,
      department: currentUser.department,
      approverId: approverId,
      approverName: targetApprover?.name || 'Atasan Direct',
      leaveType: leaveType,
      startDate: startDate,
      endDate: endDate,
      durationDays: duration,
      reason: reason,
      documentUrl: documentUrl || undefined,
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    onSubmitLeave(newReq);
    setShowForm(false);
    setReason('');
    setStartDate('');
    setEndDate('');
    setDocumentUrl('');
    alert('Pengajuan cuti berhasil dikirimkan ke atasan!');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Submit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengajuan & Kuota Cuti Realtime</h2>
          <p className="text-xs text-slate-500">
            Pantau sisa hak cuti tahunan, sakit, izin khusus, dan ajukan permohonan ke atasan.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          {showForm ? 'Tutup Formulir' : 'Buat Pengajuan Cuti Baru'}
        </button>
      </div>

      {/* Realtime Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Cuti Tahunan</p>
              <h3 className="text-3xl font-black text-indigo-950 mt-2">
                {sisaCutiTahunan} <span className="text-xs font-medium text-indigo-700">Hari Sisa</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-200/60 flex items-center justify-between text-xs text-indigo-800">
            <span>Total Hak: {quota.annualTotal} Hari</span>
            <span>Terpakai: {quota.annualUsed} Hari</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Izin Sakit</p>
              <h3 className="text-3xl font-black text-emerald-950 mt-2">
                {sisaIzinSakit} <span className="text-xs font-medium text-emerald-700">Hari Sisa</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800">
            <span>Total Hak: {quota.sickTotal} Hari</span>
            <span>Terpakai: {quota.sickUsed} Hari</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Izin Khusus</p>
              <h3 className="text-3xl font-black text-amber-950 mt-2">
                {sisaIzinKhusus} <span className="text-xs font-medium text-amber-700">Hari Sisa</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-800">
            <span>Total Hak: {quota.specialTotal} Hari</span>
            <span>Terpakai: {quota.specialUsed} Hari</span>
          </div>
        </div>

      </div>

      {/* New Leave Request Form Modal / Accordion */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-indigo-500/30 p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Formulir Pengajuan Cuti & Izin</h3>
            </div>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
              Pilih Atasan Approver
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tipe Cuti */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipe Permohonan Cuti / Izin:
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Cuti Tahunan">Cuti Tahunan (Sisa: {sisaCutiTahunan} hari)</option>
                <option value="Izin Sakit">Izin Sakit (Dokumen Surat Dokter)</option>
                <option value="Izin Khusus">Izin Khusus (Pernikahan, Duka, Keagamaan)</option>
                <option value="Cuti Melahirkan">Cuti Melahirkan / Parental</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Choose Approver */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Atasan / Approver Yang Dituju:
              </label>
              <select
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {approvers.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.position} - {app.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Mulai:
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Selesai:
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>

          {/* Duration Summary */}
          {startDate && endDate && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-900 font-medium">
              <span>Durasi Cuti Yang Diajukan:</span>
              <span className="font-bold text-sm bg-indigo-600 text-white px-3 py-0.5 rounded-lg">
                {duration} Hari Kerja
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alasan Pengajuan Cuti / Detail Keperluan:
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan alasan atau keperluan permohonan cuti Anda secara jelas..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Document URL / Link */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              URL Bukti Dokumen Pendukung (Opsional, cth: Surat Dokter / Undangan):
            </label>
            <input
              type="text"
              placeholder="https://... (Kosongkan jika tidak ada)"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Kirim Pengajuan Ke Atasan
            </button>
          </div>
        </form>
      )}

      {/* History Table of Leave Requests */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Riwayat Pengajuan Cuti Saya</h3>
          <span className="text-xs text-slate-500">{myRequests.length} Permohonan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Jenis Cuti</th>
                <th className="py-3 px-4">Periode Cuti</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4">Atasan Approver</th>
                <th className="py-3 px-4">Alasan</th>
                <th className="py-3 px-4">Status Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {myRequests.length > 0 ? (
                myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {req.leaveType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatShortDateIndo(req.startDate)} - {formatShortDateIndo(req.endDate)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600">
                      {req.durationDays} Hari
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-medium text-slate-800">{req.approverName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          req.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Ditolak'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status === 'Disetujui' && <CheckCircle2 className="w-3 h-3" />}
                        {req.status === 'Ditolak' && <XCircle className="w-3 h-3" />}
                        {req.status === 'Pending' && <Clock className="w-3 h-3 animate-spin" />}
                        {req.status}
                      </span>
                      {req.rejectionReason && (
                        <p className="text-[10px] text-rose-600 mt-1 italic">
                          Catatan: {req.rejectionReason}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada pengajuan cuti yang dikirim.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
