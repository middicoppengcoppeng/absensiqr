'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import { Settings, Lock, Database, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const [schoolName, setSchoolName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [defaultStartTime, setDefaultStartTime] = useState('06:30');
  const [defaultLateAfter, setDefaultLateAfter] = useState('07:15');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const get = (key: string) => data.find(s => s.id === key)?.value || '';
        setSchoolName(get('school_name'));
        setAcademicYear(get('academic_year'));
        setDefaultStartTime(get('default_start_time') || '06:30');
        setDefaultLateAfter(get('default_late_after') || '07:15');
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsMessage(null);
    try {
      const { error } = await supabase.from('settings').upsert([
        { id: 'school_name', value: schoolName },
        { id: 'academic_year', value: academicYear },
        { id: 'default_start_time', value: defaultStartTime },
        { id: 'default_late_after', value: defaultLateAfter },
      ]);
      if (error) throw error;
      setSettingsMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      // Trigger a custom event so layout components can re-fetch
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (err: any) {
      console.error(err);
      setSettingsMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get current user email to verify old password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('User tidak ditemukan.');

      // Verify old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        setMessage({ type: 'error', text: 'Password lama salah.' });
        setIsLoading(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      setMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Pengaturan" />
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Settings size={18} className="text-slate-600" />
            <h2 className="font-semibold text-slate-800">Pengaturan Umum</h2>
          </div>
          <div className="p-6 space-y-4">
            {settingsMessage && (
              <div className={`p-3 text-sm rounded-md border ${
                settingsMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                {settingsMessage.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sekolah</label>
              <input 
                type="text" 
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Contoh: SD Negeri 1" 
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Ajaran Aktif</label>
              <input 
                type="text" 
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Contoh: 2025/2026" 
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" 
              />
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSavingSettings ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>

        {/* Session Time Settings */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Clock size={18} className="text-slate-600" />
            <div>
              <h2 className="font-semibold text-slate-800">Jam Default Sesi Absensi</h2>
              <p className="text-xs text-slate-500 mt-0.5">Digunakan oleh tombol "Buat Sesi Hari Ini"</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jam Mulai</label>
                <input
                  type="time"
                  value={defaultStartTime}
                  onChange={(e) => setDefaultStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batas Terlambat</label>
                <input
                  type="time"
                  value={defaultLateAfter}
                  onChange={(e) => setDefaultLateAfter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Perubahan akan berlaku pada sesi berikutnya yang dibuat dengan tombol "Buat Sesi Hari Ini".</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Lock size={18} className="text-slate-600" />
            <h2 className="font-semibold text-slate-800">Keamanan</h2>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            {message && (
              <div className={`p-3 text-sm rounded-md border ${
                message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                {message.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password Lama</label>
              <input 
                type="password" 
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
              <input 
                type="password" 
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
              <input 
                type="password" 
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" 
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Memproses...' : 'Ubah Password'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Database size={18} className="text-slate-600" />
            <h2 className="font-semibold text-slate-800">Database</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-4">Database dikelola melalui Supabase. Versi saat ini berjalan normal.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-green-700 font-medium">Terhubung ke Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
