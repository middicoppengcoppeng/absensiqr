'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { supabase } from '@/lib/supabase';
import { Plus, Search, QrCode, X, Printer, Pencil, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Student {
  id: string;
  nis: string;
  full_name: string;
  status: string;
  class_id: string;
  classes: {
    name: string;
  };
  qr_tokens?: { token: string }[];
}

interface ClassData {
  id: string;
  name: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Print state
  const [printTarget, setPrintTarget] = useState<Student | 'ALL' | null>(null);
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nis: '', full_name: '', class_id: '' });

  // Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: '', nis: '', full_name: '', class_id: '' });
  
  // Dropdown state
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch classes for the dropdown
    const { data: classesData } = await supabase.from('classes').select('id, name').order('name');
    if (classesData) setClasses(classesData);

    // Fetch students with their class name and QR token
    const { data, error } = await supabase
      .from('students')
      .select(`
        id, nis, full_name, status, class_id,
        classes ( name ),
        qr_tokens ( token )
      `)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setStudents(data as unknown as Student[]);
    }
    setLoading(false);
  };

  const executeDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      const { error } = await supabase.from('students').delete().eq('id', studentToDelete.id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus siswa.');
    } finally {
      setStudentToDelete(null);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Insert Student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert([{ 
          nis: formData.nis, 
          full_name: formData.full_name, 
          class_id: formData.class_id 
        }])
        .select()
        .single();

      if (studentError) throw studentError;

      // 2. Generate and Insert QR Token
      const randomToken = `STU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const { error: qrError } = await supabase
        .from('qr_tokens')
        .insert([{ 
          student_id: studentData.id, 
          token: randomToken 
        }]);

      if (qrError) throw qrError;

      // 3. Reset and Refresh
      setFormData({ nis: '', full_name: '', class_id: '' });
      setIsAddModalOpen(false);
      await fetchData();
      
      // We need to fetch the newly created student to show it in the modal
      const newStudent = students.find(s => s.id === studentData.id) || {
        ...studentData,
        classes: { name: classes.find(c => c.id === formData.class_id)?.name || '' },
        qr_tokens: [{ token: randomToken }]
      } as Student;
      
      showQr(newStudent);

    } catch (err) {
      console.error('Error adding student:', err);
      alert('Gagal menambahkan siswa. Pastikan NIS unik.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          nis: editFormData.nis,
          full_name: editFormData.full_name,
          class_id: editFormData.class_id,
        })
        .eq('id', editFormData.id);
        
      if (error) throw error;
      setIsEditModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui data siswa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showQr = (student: Student) => {
    const token = student.qr_tokens?.[0]?.token;
    if (token) {
      setSelectedStudent(student);
      setIsQrModalOpen(true);
    } else {
      alert('Siswa ini belum memiliki QR Code.');
    }
  };

  const handlePrintAll = () => {
    setPrintTarget('ALL');
    setTimeout(() => window.print(), 100);
  };

  const handlePrintIndividual = (student: Student) => {
    setPrintTarget(student);
    setTimeout(() => window.print(), 100);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.nis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassFilter === 'ALL' || student.class_id === selectedClassFilter;
    
    return matchesSearch && matchesClass;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 20mm; }
        }
      `}} />

      <div className="print:hidden" onClick={() => actionMenuOpen && setActionMenuOpen(null)}>
        <div className="-m-4 md:-m-8 mb-4 md:mb-8">
          <Header title="Manajemen Siswa" />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari nama atau NIS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="ALL">Semua Kelas</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex w-full sm:w-auto gap-3">
              <button 
                onClick={handlePrintAll}
                className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md font-medium text-sm transition-colors border border-slate-300 flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Cetak QR ({filteredStudents.length})
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Tambah Siswa
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-medium">NIS</th>
                  <th className="px-6 py-3 font-medium">Nama Siswa</th>
                  <th className="px-6 py-3 font-medium">Kelas</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Memuat data siswa...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Data siswa tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600">{student.nis}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{student.full_name}</td>
                      <td className="px-6 py-4 text-slate-600">{student.classes?.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.status === 'ACTIVE' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {student.status === 'ACTIVE' ? 'Aktif' : 'Non-aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => showQr(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            <QrCode size={13} /> QR Code
                          </button>
                          <button 
                            onClick={() => {
                              setEditFormData({
                                id: student.id,
                                nis: student.nis,
                                full_name: student.full_name,
                                class_id: student.class_id,
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button 
                            onClick={() => setStudentToDelete({ id: student.id, name: student.full_name })}
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

        {/* Add Student Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h3 className="font-semibold text-lg text-slate-800">Tambah Siswa Baru</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddStudent} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIS</label>
                  <input 
                    type="text" 
                    required
                    value={formData.nis}
                    onChange={e => setFormData({...formData, nis: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Masukkan NIS Siswa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Masukkan Nama Lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                  <select 
                    required
                    value={formData.class_id}
                    onChange={e => setFormData({...formData, class_id: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  >
                    <option value="" disabled>Pilih Kelas</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {classes.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Anda harus menambahkan kelas terlebih dahulu melalui menu Kelas.</p>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium text-sm hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || classes.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan & Buat QR'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Viewer Modal */}
        {isQrModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden text-center">
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h3 className="font-semibold text-lg text-slate-800">QR Code Siswa</h3>
                <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-slate-100 shadow-sm inline-block">
                  <QRCodeSVG value={selectedStudent.qr_tokens?.[0]?.token || ''} size={200} level="H" />
                </div>
                <p className="mt-4 font-bold text-lg text-slate-800">{selectedStudent.full_name}</p>
                <p className="text-sm text-slate-500">{selectedStudent.nis} - {selectedStudent.classes?.name}</p>
                <p className="mt-2 font-mono text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded">
                  {selectedStudent.qr_tokens?.[0]?.token}
                </p>
              </div>
              
              <div className="p-4 border-t border-slate-200 flex gap-3">
                <button 
                  onClick={() => setIsQrModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Tutup
                </button>
                <button 
                  onClick={() => handlePrintIndividual(selectedStudent)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={16} /> Cetak
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h3 className="font-semibold text-lg text-slate-800">Edit Data Siswa</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateStudent} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIS</label>
                  <input 
                    type="text" 
                    required
                    value={editFormData.nis}
                    onChange={e => setEditFormData({...editFormData, nis: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={editFormData.full_name}
                    onChange={e => setEditFormData({...editFormData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
                  <select 
                    required
                    value={editFormData.class_id}
                    onChange={e => setEditFormData({...editFormData, class_id: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                  >
                    <option value="" disabled>Pilih Kelas</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium text-sm hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Print Area */}
      {printTarget && (
        <div id="print-area" className="hidden print:block bg-white text-black min-h-screen">
          <div className="mb-8 text-center border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase">Kartu Absensi QR Code</h1>
            <p className="text-sm mt-1">Gunakan kartu ini untuk absensi setiap hari.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {students
              .filter(s => printTarget === 'ALL' || s.id === printTarget.id)
              .map(student => {
                const token = student.qr_tokens?.[0]?.token;
                if (!token) return null;
                return (
                  <div key={student.id} className="border-2 border-black rounded-lg p-4 flex flex-col items-center text-center break-inside-avoid shadow-sm">
                    <QRCodeSVG value={token} size={140} level="H" />
                    <p className="mt-4 font-bold text-sm uppercase leading-tight h-10 flex items-center justify-center">
                      {student.full_name}
                    </p>
                    <div className="w-full border-t border-dashed border-gray-400 my-2"></div>
                    <p className="text-xs font-semibold">NIS: {student.nis}</p>
                    <p className="text-xs font-semibold">Kelas: {student.classes?.name}</p>
                    <p className="text-[10px] font-mono mt-1 text-gray-500">{token}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={executeDeleteStudent}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus siswa ${studentToDelete?.name}? Semua riwayat absensinya juga akan ikut terhapus permanen.`}
        confirmText="Hapus Siswa"
        type="danger"
      />
    </>
  );
}
