'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { supabase } from '@/lib/supabase';
import { Plus, Search, X, Eye, EyeOff, Trash2, Pencil, KeyRound } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  assigned_classes?: ClassData[];
}

interface ClassData {
  id: string;
  name: string;
  homeroom_teacher_id: string | null;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', class_ids: [] as string[] });
  const [editFormData, setEditFormData] = useState({ id: '', full_name: '', class_ids: [] as string[] });

  const [teacherToDelete, setTeacherToDelete] = useState<{id: string, name: string} | null>(null);
  
  const [teacherToReset, setTeacherToReset] = useState<{id: string, name: string} | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const { showAlert, ConfirmElement } = useConfirm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch teachers
    const { data: teachersData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'TEACHER')
      .order('full_name');
      
    // Fetch all classes to assign and map
    const { data: classesData } = await supabase
      .from('classes')
      .select('id, name, homeroom_teacher_id')
      .order('name');
      
    if (classesData) setClasses(classesData);

    if (teachersData && classesData) {
      // Map assigned classes to teachers
      const mappedTeachers = teachersData.map(t => ({
        ...t,
        assigned_classes: classesData.filter(c => c.homeroom_teacher_id === t.id)
      }));
      setTeachers(mappedTeachers);
    }
    setLoading(false);
  };

  const executeDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', teacherToDelete.id);
      if (error) throw error;
      
      // Also reset homeroom_teacher_id for their classes
      await supabase.from('classes').update({ homeroom_teacher_id: null }).eq('homeroom_teacher_id', teacherToDelete.id);
      
      fetchData();
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Gagal menghapus guru.');
    } finally {
      setTeacherToDelete(null);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/admin/create-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormSuccess(`Akun guru "${formData.full_name}" berhasil dibuat!`);
        setFormData({ full_name: '', email: '', password: '', class_ids: [] });
        fetchData();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess(null);
        }, 2000);
      } else {
        setFormError(data.message || 'Terjadi kesalahan.');
      }
    } catch {
      setFormError('Koneksi bermasalah. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/admin/update-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormSuccess(`Data guru "${editFormData.full_name}" berhasil diperbarui!`);
        fetchData();
        setTimeout(() => {
          setIsEditModalOpen(false);
          setFormSuccess(null);
        }, 1500);
      } else {
        setFormError(data.message || 'Terjadi kesalahan.');
      }
    } catch {
      setFormError('Koneksi bermasalah. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherToReset || !resetPassword) return;
    setIsSubmitting(true);
    setResetError(null);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: teacherToReset.id, newPassword: resetPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccess('Password berhasil direset!');
        setTimeout(() => {
          setTeacherToReset(null);
          setResetPassword('');
          setResetSuccess(null);
        }, 2000);
      } else {
        setResetError(data.message || 'Terjadi kesalahan.');
      }
    } catch {
      setResetError('Koneksi bermasalah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setFormData({ full_name: '', email: '', password: '', class_ids: [] });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (teacher: Teacher) => {
    setEditFormData({ 
      id: teacher.id, 
      full_name: teacher.full_name, 
      class_ids: teacher.assigned_classes?.map(c => c.id) || [] 
    });
    setFormError(null);
    setFormSuccess(null);
    setIsEditModalOpen(true);
  };

  const toggleClassSelection = (isEdit: boolean, classId: string) => {
    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        class_ids: prev.class_ids.includes(classId)
          ? prev.class_ids.filter(id => id !== classId)
          : [...prev.class_ids, classId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        class_ids: prev.class_ids.includes(classId)
          ? prev.class_ids.filter(id => id !== classId)
          : [...prev.class_ids, classId]
      }));
    }
  };

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Manajemen Guru" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Cari guru..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm" />
          </div>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Tambah Guru
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium">Nama Guru</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Kelas Ditugaskan</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Memuat...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada guru. Klik "Tambah Guru" untuk mulai.</td></tr>
              ) : teachers.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{t.full_name}</td>
                  <td className="px-6 py-4 text-slate-600">{t.email}</td>
                  <td className="px-6 py-4">
                    {t.assigned_classes && t.assigned_classes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {t.assigned_classes.map(c => (
                          <span key={c.id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Belum ada kelas</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(t)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setTeacherToReset({ id: t.id, name: t.full_name });
                          setResetPassword('');
                          setResetError(null);
                          setResetSuccess(null);
                          setShowPassword(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                      >
                        <KeyRound size={13} /> Reset PW
                      </button>
                      <button 
                        onClick={() => setTeacherToDelete({ id: t.id, name: t.full_name })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
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

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800">Tambah Guru Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddTeacher} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{formError}</div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">{formSuccess}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="Nama Lengkap Guru"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (untuk Login)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  placeholder="guru@sekolah.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Berikan password ini kepada guru yang bersangkutan.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tugaskan Kelas</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
                  {classes.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.class_ids.includes(c.id)}
                        onChange={() => toggleClassSelection(false, c.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {c.name}
                    </label>
                  ))}
                  {classes.length === 0 && <p className="text-xs text-slate-500 col-span-2">Belum ada kelas.</p>}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium text-sm hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Membuat Akun...' : 'Buat Akun Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800">Edit Data Guru</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleEditTeacher} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{formError}</div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">{formSuccess}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editFormData.full_name}
                  onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tugaskan Kelas</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
                  {classes.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editFormData.class_ids.includes(c.id)}
                        onChange={() => toggleClassSelection(true, c.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {c.name}
                    </label>
                  ))}
                  {classes.length === 0 && <p className="text-xs text-slate-500 col-span-2">Belum ada kelas.</p>}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium text-sm hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {teacherToReset && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800">Reset Password</h3>
              <button onClick={() => setTeacherToReset(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleResetPassword} className="p-4 space-y-4">
              <p className="text-sm text-slate-600">
                Reset password untuk guru <strong>{teacherToReset.name}</strong>.
              </p>
              
              {resetError && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{resetError}</div>}
              {resetSuccess && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">{resetSuccess}</div>}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={resetPassword}
                    onChange={e => setResetPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTeacherToReset(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium text-sm hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!teacherToDelete}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={executeDeleteTeacher}
        title="Hapus Akun Guru"
        message={`Apakah Anda yakin ingin menghapus akun guru ${teacherToDelete?.name}? Guru ini tidak akan bisa login lagi ke sistem.`}
        confirmText="Hapus Guru"
        type="danger"
      />
      {ConfirmElement}
    </>
  );
}
