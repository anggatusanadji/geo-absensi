import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { MapPin, UserCheck, ShieldCheck, User, Clock, ChevronDown, LogOut, Phone } from 'lucide-react';
import { getCurrentTimeString, formatDateIndo } from '../utils/geoUtils';

interface NavbarProps {
  currentUser: Employee;
  employees?: Employee[];
  onLogout: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
}) => {
  const [time, setTime] = useState(getCurrentTimeString());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getCurrentTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
            <ShieldCheck className="w-3 h-3 text-amber-600" /> Admin HR
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
            <UserCheck className="w-3 h-3 text-indigo-600" /> Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            <User className="w-3 h-3 text-emerald-600" /> Karyawan
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <MapPin className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">GeoAbsen HRIS</h1>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cloud
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Sistem Presensi Geofence & HRIS Karyawan</p>
            </div>
          </div>

          {/* Clock Widget */}
          <div className="hidden md:flex items-center gap-2.5 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4 text-indigo-600 animate-spin-slow" />
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 tracking-wider font-mono">{time} WIB</div>
              <div className="text-[10px] text-slate-500">{formatDateIndo(new Date().toISOString())}</div>
            </div>
          </div>

          {/* User Profile & Logout Button */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition bg-white shadow-2xs cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-indigo-500/20"
              />
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</span>
                  {getRoleBadge(currentUser.role)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{currentUser.nip} • {currentUser.department}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {/* Profile Detail & Logout Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.position}</p>
                    <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px] font-semibold">{currentUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>NIP:</span>
                    <span className="font-mono font-bold text-slate-700">{currentUser.nip}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  Keluar Akun
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
