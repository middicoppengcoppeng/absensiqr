'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { supabase } from '@/lib/supabase';
import { Plus, Search, X, Trash2, Pencil } from 'lucide-react';

interface Class {
  id: string;
  name: string;
  grade_level: string;
  major: string;
  status: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', grade_level: '' });
  const [editFormData, setEditFormData] = useState({ id: '', name: '', grade_level: '' });

  const [classToDelete, setClassToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('classes').select('*').order('name');
    if (!error && data) setClasses(data);
    setLoading(false);
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('classes').insert([formData]);
    setIsSubmitting(false);
    
    if (error) {
      alert('Gagal menambahkan kelas.');
    } else {
      setFormData({ name: '', grade_level: '' });
      setIsAddModalOpen(false);
      fetchClasses();
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('classes')
        .update({
          name: editFormData.name,
          grade_level: editFormData.grade_level
        })
        .eq('id', editFormData.id);
        
      if (error) throw error;
      setIsEditModalOpen(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui kelas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDeleteClass = async () => {
    if (!classToDelete) return;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', classToDelete.id);
      if (error) throw error;
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus kelas.');
    } finally {
      setClassToDelete(null);
    }
  };

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Manajemen Kelas" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari kelas..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Tambah Kelas
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium">Nama Kelas</th>
                <th className="px-6 py-3 font-medium">Tingkat</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Memuat...</td></tr>
              ) : classes.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada kelas.</td></tr>
              ) : (
                classes.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{c.name}</td>
                    <td className="px-6 py-4">{c.grade_level}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditFormData({ id: c.id, name: c.name, grade_level: c.grade_level });
                            setIsEditModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button 
                          onClick={() => setClassToDelete({ id: c.id, name: c.name })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800">Tambah Kelas</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddClass} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kelas (e.g. 1A, 2B)</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat (e.g. 1, 2, 3)</label>
                <input required value={formData.grade_level} onChange={e => setFormData({...formData, grade_level: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-md">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800">Edit Kelas</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateClass} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kelas (e.g. 1A, 2B)</label>
                <input required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat (e.g. 1, 2, 3)</label>
                <input required value={editFormData.grade_level} onChange={e => setEditFormData({...editFormData, grade_level: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-md">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md">{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        onConfirm={executeDeleteClass}
        title="Hapus Kelas"
        message={`Apakah Anda yakin ingin menghapus kelas ${classToDelete?.name}? Data terkait kelas ini mungkin ikut terhapus.`}
        confirmText="Hapus Kelas"
        type="danger"
      />
    </>
  );
}
