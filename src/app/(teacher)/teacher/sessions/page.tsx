'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { supabase } from '@/lib/supabase';
import { Plus, X, PowerOff, Play, Trash2, Zap } from 'lucide-react';

interface Session {
  id: string;
  attendance_date: string;
  start_time: string;
  late_after: string;
  status: string;
  classes: { name: string };
}

interface ClassData { id: string; name: string; }

export default function TeacherSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    class_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    start_time: '06:30',
    late_after: '07:15',
    end_time: '08:00',
  });

  const [sessionToToggle, setSessionToToggle] = useState<{id: string, status: string, newStatus: string} | null>(null);
  const [quickMessage, setQuickMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cls } = await supabase
      .from('classes')
      .select('id, name')
      .eq('homeroom_teacher_id', user.id);
      
    if (cls) setClasses(cls);

    const classIds = cls?.map(c => c.id) || [];
    
    if (classIds.length > 0) {
      const { data } = await supabase
        .from('attendance_sessions')
        .select('*, classes(name)')
        .in('class_id', classIds)
        .order('attendance_date', { ascending: false });
      if (data) setSessions(data as any);
    } else {
      setSessions([]);
    }
    
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await supabase.from('attendance_sessions').insert([formData]);
    setIsSubmitting(false);
    setIsModalOpen(false);
    fetchData();
  };

  const handleCreateTodaySessions = async () => {
    if (classes.length === 0) {
      setQuickMessage({ type: 'error', text: 'Anda belum ditugaskan ke kelas manapun.' });
      setTimeout(() => setQuickMessage(null), 3000);
      return;
    }
    setIsSubmitting(true);
    const today = new Date().toISOString().split('T')[0];
    const { data: { user } } = await supabase.auth.getUser();

    // Check which classes already have a session today
    const { data: existingSessions } = await supabase
      .from('attendance_sessions')
      .select('class_id')
      .in('class_id', classes.map(c => c.id))
      .eq('attendance_date', today);

    const existingClassIds = new Set(existingSessions?.map((s: any) => s.class_id) || []);
    const classesToCreate = classes.filter(c => !existingClassIds.has(c.id));

    if (classesToCreate.length === 0) {
      setQuickMessage({ type: 'error', text: 'Sesi untuk semua kelas hari ini sudah ada.' });
      setTimeout(() => setQuickMessage(null), 3000);
      setIsSubmitting(false);
      return;
    }

    const sessionsToInsert = classesToCreate.map(c => ({
      class_id: c.id,
      teacher_id: user?.id,
      attendance_date: today,
      start_time: '06:30',
      late_after: '07:15',
      end_time: '08:00',
    }));

    const { error } = await supabase.from('attendance_sessions').insert(sessionsToInsert);
    setIsSubmitting(false);

    if (error) {
      setQuickMessage({ type: 'error', text: 'Gagal membuat sesi.' });
    } else {
      setQuickMessage({ type: 'success', text: `${classesToCreate.length} sesi berhasil dibuat untuk hari ini!` });
      fetchData();
    }
    setTimeout(() => setQuickMessage(null), 4000);
  };

  const requestToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    setSessionToToggle({ id, status: currentStatus, newStatus });
  };

  const executeToggleStatus = async () => {
    if (!sessionToToggle) return;

    try {
      const { error } = await supabase
        .from('attendance_sessions')
        .update({ status: sessionToToggle.newStatus })
        .eq('id', sessionToToggle.id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah status sesi.');
    } finally {
      setSessionToToggle(null);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sesi ini? Semua data absensi terkait juga akan ikut terhapus.')) return;
    
    try {
      const { error: attError } = await supabase.from('attendances').delete().eq('session_id', id);
      if (attError) throw attError;

      const { error: sessError } = await supabase.from('attendance_sessions').delete().eq('id', id);
      if (sessError) throw sessError;

      fetchData();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus sesi.');
    }
  };

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Sesi Absensi" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {quickMessage && (
            <div className={`text-sm px-3 py-2 rounded-md flex-1 ${
              quickMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {quickMessage.text}
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleCreateTodaySessions}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            >
              <Zap size={16} /> Buat Sesi Hari Ini
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <Plus size={16} /> Buat Sesi
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium">Kelas</th>
                <th className="px-6 py-3 font-medium">Mulai</th>
                <th className="px-6 py-3 font-medium">Batas Terlambat</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Memuat...</td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada sesi.</td></tr>
              ) : sessions.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{s.attendance_date}</td>
                  <td className="px-6 py-4">{s.classes?.name}</td>
                  <td className="px-6 py-4">{s.start_time}</td>
                  <td className="px-6 py-4 text-amber-600">{s.late_after}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${s.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {s.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {s.status === 'ACTIVE' ? (
                        <button
                          onClick={() => requestToggleStatus(s.id, s.status)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
                        >
                          <PowerOff size={13} /> Nonaktifkan
                        </button>
                      ) : (
                        <button
                          onClick={() => requestToggleStatus(s.id, s.status)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        >
                          <Play size={13} /> Aktifkan
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Buat Sesi Absensi</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                <select required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="" disabled>Pilih Kelas</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input type="date" required value={formData.attendance_date} onChange={e => setFormData({...formData, attendance_date: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mulai</label>
                  <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Batas Terlambat</label>
                  <input type="time" value={formData.late_after} onChange={e => setFormData({...formData, late_after: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-md text-sm">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Buat Sesi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!sessionToToggle}
        onClose={() => setSessionToToggle(null)}
        onConfirm={executeToggleStatus}
        title={sessionToToggle?.newStatus === 'ACTIVE' ? 'Aktifkan Sesi' : 'Nonaktifkan Sesi'}
        message={`Apakah Anda yakin ingin ${sessionToToggle?.newStatus === 'ACTIVE' ? 'mengaktifkan' : 'menonaktifkan'} sesi absensi ini?`}
        confirmText={sessionToToggle?.newStatus === 'ACTIVE' ? 'Aktifkan' : 'Nonaktifkan'}
        type={sessionToToggle?.newStatus === 'ACTIVE' ? 'warning' : 'danger'}
      />
    </>
  );
}
