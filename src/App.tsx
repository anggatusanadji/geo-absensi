import React, { useState, useEffect } from 'react';
import {
  Employee,
  OfficeLocation,
  AttendanceRecord,
  LeaveRequest,
  Holiday,
} from './types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_OFFICE_LOCATIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_HOLIDAYS,
} from './data/initialData';
import {
  subscribeCollection,
  saveDocument,
  removeDocument,
  seedInitialCollectionIfEmpty,
} from './lib/firestoreSync';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { AttendanceCheckIn } from './components/karyawan/AttendanceCheckIn';
import { AttendanceHistory } from './components/karyawan/AttendanceHistory';
import { LeaveSubmission } from './components/karyawan/LeaveSubmission';
import { UserProfile } from './components/karyawan/UserProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeeManagement } from './components/admin/EmployeeManagement';
import { OfficeLocationManagement } from './components/admin/OfficeLocationManagement';
import { HolidayManagement } from './components/admin/HolidayManagement';
import { LeaveApproval } from './components/admin/LeaveApproval';
import { AttendanceReport } from './components/admin/AttendanceReport';
import {
  MapPin,
  Calendar,
  FileText,
  User,
  LayoutDashboard,
  Users,
  Building2,
  CalendarRange,
  UserCheck,
  BarChart3,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const adminHR = INITIAL_EMPLOYEES[0];

  // Load state from localStorage or initial dataset
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('geoabsen_employees');
    if (saved) {
      const parsed: Employee[] = JSON.parse(saved);
      // Ensure Admin HR user is always present for initial access
      if (!parsed.some((e) => e.id === adminHR.id || e.phone.replace(/[^0-9]/g, '') === adminHR.phone.replace(/[^0-9]/g, ''))) {
        parsed.unshift(adminHR);
      }
      return parsed;
    }
    return INITIAL_EMPLOYEES;
  });

  const [offices, setOffices] = useState<OfficeLocation[]>(() => {
    const saved = localStorage.getItem('geoabsen_offices');
    return saved ? JSON.parse(saved) : INITIAL_OFFICE_LOCATIONS;
  });

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('geoabsen_attendances');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_RECORDS;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('geoabsen_leaverequests');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    const saved = localStorage.getItem('geoabsen_holidays');
    return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS;
  });

  // Logged-in session management
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('geoabsen_logged_user_id') || '';
  });

  const currentUser = employees.find((e) => e.id === currentUserId) || null;

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('absen');

  // Sync state with Firestore on mount
  useEffect(() => {
    // 1. Seed initial data if Firestore collections are empty
    seedInitialCollectionIfEmpty('users', INITIAL_EMPLOYEES);
    seedInitialCollectionIfEmpty('officeLocations', INITIAL_OFFICE_LOCATIONS);
    seedInitialCollectionIfEmpty('attendances', INITIAL_ATTENDANCE_RECORDS);
    seedInitialCollectionIfEmpty('leaveRequests', INITIAL_LEAVE_REQUESTS);
    seedInitialCollectionIfEmpty('holidays', INITIAL_HOLIDAYS);

    // Pastikan Admin HR selalu tersimpan di Firestore
    saveDocument('users', INITIAL_EMPLOYEES[0]);

    // 2. Real-time listeners for Cloud Database
    const unsubEmployees = subscribeCollection<Employee>('users', (data) => {
      const list = [...data];
      // Ensure Admin HR user exists if not found in Firestore
      if (!list.some((e) => e.id === adminHR.id || e.phone.replace(/[^0-9]/g, '') === adminHR.phone.replace(/[^0-9]/g, ''))) {
        list.unshift(adminHR);
      }
      setEmployees(list);
    });
    const unsubOffices = subscribeCollection<OfficeLocation>('officeLocations', (data) => setOffices(data));
    const unsubAttendances = subscribeCollection<AttendanceRecord>('attendances', (data) => setAttendances(data));
    const unsubLeave = subscribeCollection<LeaveRequest>('leaveRequests', (data) => setLeaveRequests(data));
    const unsubHolidays = subscribeCollection<Holiday>('holidays', (data) => setHolidays(data));

    return () => {
      unsubEmployees();
      unsubOffices();
      unsubAttendances();
      unsubLeave();
      unsubHolidays();
    };
  }, []);

  // Save to localStorage whenever state updates (for offline fallback)
  useEffect(() => {
    localStorage.setItem('geoabsen_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('geoabsen_offices', JSON.stringify(offices));
  }, [offices]);

  useEffect(() => {
    localStorage.setItem('geoabsen_attendances', JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem('geoabsen_leaverequests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('geoabsen_holidays', JSON.stringify(holidays));
  }, [holidays]);

  // Handler functions with Firestore synchronization
  const handleAddAttendance = (record: AttendanceRecord) => {
    setAttendances((prev) => [record, ...prev]);
    saveDocument('attendances', record);
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendances((prev) => prev.map((a) => (a.id === record.id ? record : a)));
    saveDocument('attendances', record);
  };

  const handleSubmitLeave = (req: LeaveRequest) => {
    setLeaveRequests((prev) => [req, ...prev]);
    saveDocument('leaveRequests', req);
  };

  const handleApproveLeave = (reqId: string) => {
    const targetReq = leaveRequests.find((r) => r.id === reqId);
    if (!targetReq) return;

    const updatedReq: LeaveRequest = {
      ...targetReq,
      status: 'Disetujui',
      approvedAt: new Date().toISOString(),
    };

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === reqId ? updatedReq : r))
    );
    saveDocument('leaveRequests', updatedReq);

    // Deduct annual quota from employee if leaveType is Cuti Tahunan
    if (targetReq.leaveType === 'Cuti Tahunan') {
      const targetEmp = employees.find((e) => e.id === targetReq.userId);
      if (targetEmp) {
        const updatedEmp: Employee = {
          ...targetEmp,
          leaveQuota: {
            ...targetEmp.leaveQuota,
            annualUsed: targetEmp.leaveQuota.annualUsed + targetReq.durationDays,
          },
        };
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === targetReq.userId ? updatedEmp : emp))
        );
        saveDocument('users', updatedEmp);
      }
    }
  };

  const handleRejectLeave = (reqId: string, reason: string) => {
    const targetReq = leaveRequests.find((r) => r.id === reqId);
    if (!targetReq) return;

    const updatedReq: LeaveRequest = {
      ...targetReq,
      status: 'Ditolak',
      rejectionReason: reason,
    };

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === reqId ? updatedReq : r))
    );
    saveDocument('leaveRequests', updatedReq);
  };

  const handleAddEmployee = (emp: Employee) => {
    setEmployees((prev) => [...prev, emp]);
    saveDocument('users', emp);
  };

  const handleUpdateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? emp : e)));
    saveDocument('users', emp);
  };

  const handleDeleteEmployee = (id: string) => {
    if (id === 'emp-admin' || id === currentUser?.id) {
      alert('Akun Admin HR Utama yang sedang aktif digunakan tidak dapat dihapus.');
      return;
    }
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    removeDocument('users', id);
  };

  const handleAddOffice = (office: OfficeLocation) => {
    setOffices((prev) => [...prev, office]);
    saveDocument('officeLocations', office);
  };

  const handleUpdateOffice = (office: OfficeLocation) => {
    setOffices((prev) => prev.map((o) => (o.id === office.id ? office : o)));
    saveDocument('officeLocations', office);
  };

  const handleDeleteOffice = (id: string) => {
    setOffices((prev) => prev.filter((o) => o.id !== id));
    removeDocument('officeLocations', id);
  };

  const handleAddHoliday = (holiday: Holiday) => {
    setHolidays((prev) => [holiday, ...prev]);
    saveDocument('holidays', holiday);
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    removeDocument('holidays', id);
  };

  // Auth Handlers
  const handleLogin = (user: Employee) => {
    setCurrentUserId(user.id);
    localStorage.setItem('geoabsen_logged_user_id', user.id);
    if (user.role === 'admin') {
      setActiveTab('dashboard');
    } else if (user.role === 'manager') {
      setActiveTab('approval');
    } else {
      setActiveTab('absen');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('geoabsen_logged_user_id');
    setCurrentUserId('');
  };

  // If user is not logged in, show Login screen
  if (!currentUser) {
    return <Login employees={employees} onLogin={handleLogin} />;
  }

  // Count pending leave requests for approver badge
  const pendingForCurrentApprover = leaveRequests.filter((r) => {
    if (r.status !== 'Pending') return false;
    if (currentUser.role === 'admin') return true;
    return r.approverId === currentUser.id || r.department === currentUser.department;
  }).length;

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
      />

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-[61px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            
            {/* Karyawan / Shared Tabs */}
            <button
              onClick={() => setActiveTab('absen')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'absen'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" /> Absen GPS
            </button>

            <button
              onClick={() => setActiveTab('riwayat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'riwayat'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" /> Riwayat Kehadiran
            </button>

            <button
              onClick={() => setActiveTab('cuti')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === 'cuti'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Pengajuan Cuti & Kuota
            </button>

            {/* Manager / Approver Tab */}
            {(currentUser.role === 'manager' || currentUser.role === 'admin') && (
              <button
                onClick={() => setActiveTab('approval')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 relative ${
                  activeTab === 'approval'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <UserCheck className="w-4 h-4" /> Persetujuan Cuti
                {pendingForCurrentApprover > 0 && (
                  <span className="ml-1 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    {pendingForCurrentApprover}
                  </span>
                )}
              </button>
            )}

            {/* Admin Management Tabs */}
            {currentUser.role === 'admin' && (
              <>
                <div className="h-5 w-px bg-slate-200 mx-1 shrink-0" />

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard Admin
                </button>

                <button
                  onClick={() => setActiveTab('karyawan')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeTab === 'karyawan'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" /> Kelola Karyawan & Role
                </button>

                <button
                  onClick={() => setActiveTab('lokasi')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeTab === 'lokasi'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Lokasi GPS Kantor
                </button>

                <button
                  onClick={() => setActiveTab('libur')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeTab === 'libur'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <CalendarRange className="w-4 h-4" /> Kelola Hari Libur
                </button>

                <button
                  onClick={() => setActiveTab('rekap')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                    activeTab === 'rekap'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Rekapitulasi Laporan
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('profil')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ml-auto ${
                activeTab === 'profil'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" /> Profil & Libur Saya
            </button>

          </div>
        </div>
      </nav>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'absen' && (
          <AttendanceCheckIn
            currentUser={currentUser}
            offices={offices}
            attendances={attendances}
            onAddAttendance={handleAddAttendance}
            onUpdateAttendance={handleUpdateAttendance}
          />
        )}

        {activeTab === 'riwayat' && (
          <AttendanceHistory currentUser={currentUser} attendances={attendances} />
        )}

        {activeTab === 'cuti' && (
          <LeaveSubmission
            currentUser={currentUser}
            employees={employees}
            leaveRequests={leaveRequests}
            onSubmitLeave={handleSubmitLeave}
          />
        )}

        {activeTab === 'profil' && (
          <UserProfile
            currentUser={currentUser}
            holidays={holidays}
            offices={offices}
          />
        )}

        {activeTab === 'approval' && (
          <LeaveApproval
            currentUser={currentUser}
            employees={employees}
            leaveRequests={leaveRequests}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
          />
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboard
            employees={employees}
            attendances={attendances}
            leaveRequests={leaveRequests}
            offices={offices}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'karyawan' && (
          <EmployeeManagement
            employees={employees}
            offices={offices}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {activeTab === 'lokasi' && (
          <OfficeLocationManagement
            offices={offices}
            onAddOffice={handleAddOffice}
            onUpdateOffice={handleUpdateOffice}
            onDeleteOffice={handleDeleteOffice}
          />
        )}

        {activeTab === 'libur' && (
          <HolidayManagement
            holidays={holidays}
            employees={employees}
            onAddHoliday={handleAddHoliday}
            onDeleteHoliday={handleDeleteHoliday}
          />
        )}

        {activeTab === 'rekap' && (
          <AttendanceReport
            employees={employees}
            attendances={attendances}
            leaveRequests={leaveRequests}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 PT Nusantara Digital — Sistem Presensi GPS & Cuti Terintegrasi.</p>
          <div className="flex items-center gap-3">
            <span>Sistem Geofencing GPS Aktif</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Verifikasi Kamera & Koordinat</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
