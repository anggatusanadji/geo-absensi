import React, { useState } from 'react';
import { Building2, Phone, Lock, LogIn, ShieldAlert, Eye, EyeOff, UserCheck } from 'lucide-react';
import { Employee } from '../types';
import { INITIAL_EMPLOYEES } from '../data/initialData';

interface LoginProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
}

export const Login: React.FC<LoginProps> = ({ employees, onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize phone number (removes dashes, spaces)
  const cleanPhone = (val: string) => val.replace(/[^0-9]/g, '');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const inputCleanPhone = cleanPhone(phone);
      
      // Find matching employee in active employees list (plus fallback Admin HR)
      const adminHR = INITIAL_EMPLOYEES[0];
      const searchList = [...employees];
      if (!searchList.some((u) => cleanPhone(u.phone) === cleanPhone(adminHR.phone))) {
        searchList.push(adminHR);
      }

      // Find matching employee
      const foundUser = searchList.find((emp) => {
        const empCleanPhone = cleanPhone(emp.phone);
        return empCleanPhone === inputCleanPhone;
      });

      if (!foundUser) {
        setError('Nomor telepon tidak terdaftar dalam sistem HRIS.');
        setIsLoading(false);
        return;
      }

      if (foundUser.status !== 'Aktif') {
        setError('Akun Anda dalam status Non-Aktif. Silakan hubungi Admin HR.');
        setIsLoading(false);
        return;
      }

      // Check password (if set, or fallback default 'admin' / '123')
      const userPassword = foundUser.password || 'admin';
      if (password !== userPassword) {
        setError('Kata sandi yang Anda masukkan salah.');
        setIsLoading(false);
        return;
      }

      // Successful login
      setIsLoading(false);
      onLogin(foundUser);
    }, 400);
  };

  const handleFillAdmin = () => {
    setPhone('083111222333');
    setPassword('admin');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 mb-4 border border-indigo-400/30">
            <Building2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">GeoAbsen HRIS</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Sistem Presensi Geofence & Manajemen Karyawan
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-700 pb-4">
            <h2 className="text-lg font-bold text-white">Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gunakan nomor HP terdaftar dan kata sandi untuk melanjutkan.
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-rose-300 text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gagal Masuk</p>
                <p className="text-[11px] text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nomor Telepon / HP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 083111222333"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-900/80 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  MASUK SEKARANG
                </>
              )}
            </button>
          </form>

          {/* Preset Admin HR Quick Credentials Box */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Akun Admin HR Utama:
              </span>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-semibold rounded-lg text-[11px] border border-indigo-500/30 transition cursor-pointer"
              >
                Isi Otomatis
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block">No. Telepon:</span>
                <span className="font-mono font-bold text-white">083111222333</span>
              </div>
              <div>
                <span className="text-slate-400 block">Password:</span>
                <span className="font-mono font-bold text-white">admin</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} GeoAbsen HRIS. Cloud Connected.
        </p>
      </div>
    </div>
  );
};
