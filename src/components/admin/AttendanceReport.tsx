import React, { useState } from 'react';
import { Employee, AttendanceRecord, LeaveRequest } from '../../types';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  Download,
} from 'lucide-react';

interface AttendanceReportProps {
  employees: Employee[];
  attendances: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({
  employees,
  attendances,
  leaveRequests,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [selectedDept, setSelectedDept] = useState<string>('semua');

  // Unique departments
  const departments = Array.from(new Set(employees.map((e) => e.department)));

  // Filter employees
  const filteredEmployees = employees.filter((e) => {
    return selectedDept === 'semua' || e.department === selectedDept;
  });

  // Calculate monthly stats per employee
  const reportData = filteredEmployees.map((emp) => {
    const empRecords = attendances.filter(
      (a) => a.userId === emp.id && a.date.startsWith(selectedMonth)
    );

    const totalHadir = empRecords.filter((r) => r.checkInTime).length;
    const tepatWaktu = empRecords.filter((r) => r.status === 'Tepat Waktu').length;
    const terlambat = empRecords.filter((r) => r.status === 'Terlambat').length;

    // Count approved leave days in this month
    const empLeaves = leaveRequests.filter(
      (l) => l.userId === emp.id && l.status === 'Disetujui' && l.startDate.startsWith(selectedMonth)
    );
    const totalIzinCuti = empLeaves.reduce((acc, curr) => acc + curr.durationDays, 0);

    // Assuming 22 working days in a standard month
    const workingDaysInMonth = 22;
    const alpha = Math.max(0, workingDaysInMonth - totalHadir - totalIzinCuti);

    return {
      emp,
      totalHadir,
      tepatWaktu,
      terlambat,
      totalIzinCuti,
      alpha,
    };
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'NIP,Nama Karyawan,Departemen,Jabatan,Total Hadir,Tepat Waktu,Terlambat,Izin/Cuti,Alpha\n';

    reportData.forEach((row) => {
      csvContent += `"${row.emp.nip}","${row.emp.name}","${row.emp.department}","${row.emp.position}",${row.totalHadir},${row.tepatWaktu},${row.terlambat},${row.totalIzinCuti},${row.alpha}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Kehadiran_${selectedMonth}_${selectedDept}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Rekapitulasi Laporan Kehadiran Bulanan</h2>
          <p className="text-xs text-slate-500">
            Laporan rekap harian, keterlambatan, izin cuti, dan persentase disiplin karyawan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Download className="w-4 h-4" /> Export CSV / Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] text-slate-500">Bulan & Tahun:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] text-slate-500">Departemen:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800"
            >
              <option value="semua">Semua Departemen</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Terdaftar: <strong className="text-slate-800">{reportData.length} Karyawan</strong>
        </div>
      </div>

      {/* Recap Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden print:shadow-none print:border-none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Tabel Rekapitulasi Presensi Periode: {selectedMonth}
          </h3>
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
            Standard 22 Hari Kerja
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4 text-center">Hadir (Hari)</th>
                <th className="py-3 px-4 text-center text-emerald-700">Tepat Waktu</th>
                <th className="py-3 px-4 text-center text-amber-700">Terlambat</th>
                <th className="py-3 px-4 text-center text-indigo-700">Izin / Cuti</th>
                <th className="py-3 px-4 text-center text-rose-700">Alpha</th>
                <th className="py-3 px-4 text-center">Kedisiplinan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reportData.map(({ emp, totalHadir, tepatWaktu, terlambat, totalIzinCuti, alpha }) => {
                const disciplineRate =
                  totalHadir > 0 ? Math.round((tepatWaktu / totalHadir) * 100) : 100;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">{emp.nip}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{emp.department}</td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {totalHadir}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      {tepatWaktu}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-amber-600">
                      {terlambat}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-indigo-600">
                      {totalIzinCuti}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-rose-600">
                      {alpha}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          disciplineRate >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : disciplineRate >= 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {disciplineRate}% Tepat Waktu
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
