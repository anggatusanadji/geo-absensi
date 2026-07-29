import React, { useState } from 'react';
import { LeaveRequest, Employee } from '../../types';
import { formatShortDateIndo } from '../../utils/geoUtils';
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  FileText,
  AlertCircle,
  Check,
  X,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface LeaveApprovalProps {
  currentUser: Employee;
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onApproveLeave: (requestId: string) => void;
  onRejectLeave: (requestId: string, reason: string) => void;
}

export const LeaveApproval: React.FC<LeaveApprovalProps> = ({
  currentUser,
  employees,
  leaveRequests,
  onApproveLeave,
  onRejectLeave,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [rejectingReq, setRejectingReq] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // If user is Manager, show requests assigned to them or from same department
  // If user is Admin, show all requests across company
  const relevantRequests = leaveRequests.filter((req) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') {
      return (
        req.approverId === currentUser.id ||
        req.department === currentUser.department
      );
    }
    return req.approverId === currentUser.id;
  });

  const filteredRequests = relevantRequests.filter((req) => {
    if (statusFilter === 'semua') return true;
    return req.status === statusFilter;
  });

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq) return;
    onRejectLeave(rejectingReq.id, rejectionReason || 'Alasan operasional departemen');
    setRejectingReq(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Persetujuan Cuti & Izin Karyawan</h2>
          <p className="text-xs text-slate-500">
            Persetujuan permohonan cuti bawahan departemen ({currentUser.department}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          >
            <option value="Pending">Perlu Persetujuan (Pending)</option>
            <option value="Disetujui font-bold text-emerald-600">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
            <option value="semua">Semua Status</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => {
            const applicant = employees.find((e) => e.id === req.userId);
            const remainingAnnual = applicant
              ? applicant.leaveQuota.annualTotal - applicant.leaveQuota.annualUsed
              : 0;

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        applicant?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={req.userName}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-50 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{req.userName}</h3>
                        <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {req.userNip}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {req.department} • Sisa Cuti Tahunan: <strong className="text-indigo-600">{remainingAnnual} Hari</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                        req.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Ditolak'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === 'Disetujui' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {req.status === 'Ditolak' && <XCircle className="w-3.5 h-3.5" />}
                      {req.status === 'Pending' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Jenis Permohonan:</span>
                    <span className="font-bold text-slate-800">{req.leaveType}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Periode & Durasi:</span>
                    <span className="font-semibold text-slate-800">
                      {formatShortDateIndo(req.startDate)} - {formatShortDateIndo(req.endDate)}{' '}
                      <strong className="text-indigo-600">({req.durationDays} Hari)</strong>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Approver Dituju:</span>
                    <span className="font-semibold text-slate-800">{req.approverName}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">Alasan Pengajuan Cuti:</span>
                  <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {req.reason}
                  </p>
                </div>

                {req.documentUrl && (
                  <div className="text-xs">
                    <a
                      href={req.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:underline bg-indigo-50 px-3 py-1.5 rounded-xl"
                    >
                      <FileText className="w-4 h-4" /> Lihat Dokumen Lampiran / Surat Dokter
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                )}

                {req.rejectionReason && (
                  <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <strong>Alasan Penolakan:</strong> {req.rejectionReason}
                  </div>
                )}

                {/* Approve / Reject Actions (for Pending status) */}
                {req.status === 'Pending' && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingReq(req);
                        setRejectionReason('');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition"
                    >
                      <X className="w-4 h-4" /> Tolak Pengajuan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApproveLeave(req.id);
                        alert(`Pengajuan cuti ${req.userName} disetujui!`);
                      }}
                      className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      <Check className="w-4 h-4" /> Setujui Cuti ({req.durationDays} Hari)
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Tidak ada permohonan cuti dengan status '{statusFilter}'.
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReject}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Penolakan Permohonan Cuti - {rejectingReq.userName}
              </h3>
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Berikan catatan / alasan mengapa pengajuan cuti ini ditolak:
              </p>
              <textarea
                required
                rows={3}
                placeholder="Contoh: Beban kerja tim tinggi pada tanggal tersebut..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
