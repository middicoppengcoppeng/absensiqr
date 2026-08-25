'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';
import { Search } from 'lucide-react';

interface Student {
  id: string;
  nis: string;
  full_name: string;
  status: string;
  class_id: string;
  classes: {
    name: string;
  };
}

interface ClassData {
  id: string;
  name: string;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Get current teacher
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch classes assigned to this teacher
    const { data: classesData } = await supabase
      .from('classes')
      .select('id, name')
      .eq('homeroom_teacher_id', user.id)
      .order('name');
      
    if (classesData) {
      setClasses(classesData);
      
      const classIds = classesData.map(c => c.id);
      
      if (classIds.length > 0) {
        // Fetch students only for those classes
        const { data } = await supabase
          .from('students')
          .select(`
            id, nis, full_name, status, class_id,
            classes ( name )
          `)
          .in('class_id', classIds)
          .order('full_name');
          
        if (data) {
          setStudents(data as unknown as Student[]);
        }
      }
    }
    
    setLoading(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.nis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassFilter === 'ALL' || student.class_id === selectedClassFilter;
    
    return matchesSearch && matchesClass;
  });

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Daftar Siswa" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
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
              <option value="ALL">Semua Kelas Saya</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Memuat data siswa...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    {classes.length === 0 
                      ? 'Anda belum ditugaskan ke kelas manapun.'
                      : 'Data siswa tidak ditemukan.'}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
