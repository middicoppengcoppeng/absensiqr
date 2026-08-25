'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';

interface Attendance {
  id: string;
  scan_time: string;
  status: string;
  students: { full_name: string; nis: string };
  attendance_sessions: { attendance_date: string; classes: { name: string } };
}

const statusColors: Record<string, string> = {
  HADIR: 'bg-green-50 text-green-700',
  TERLAMBAT: 'bg-amber-50 text-amber-700',
  IZIN: 'bg-blue-50 text-blue-700',
  SAKIT: 'bg-slate-100 text-slate-700',
  ALPA: 'bg-red-50 text-red-700',
};

export default function TeacherHistoryPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendances')
        .select(`id, scan_time, status, students(full_name, nis), attendance_sessions(attendance_date, classes(name))`)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) setAttendances(data as any);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Riwayat Absensi" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Riwayat Scan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium">Siswa</th>
                <th className="px-6 py-3 font-medium">NIS</th>
                <th className="px-6 py-3 font-medium">Kelas</th>
                <th className="px-6 py-3 font-medium">Jam</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Memuat...</td></tr>
              ) : attendances.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada data absensi.</td></tr>
              ) : attendances.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{a.attendance_sessions?.attendance_date}</td>
                  <td className="px-6 py-4 font-medium">{a.students?.full_name}</td>
                  <td className="px-6 py-4 text-slate-500">{a.students?.nis}</td>
                  <td className="px-6 py-4">{(a.attendance_sessions as any)?.classes?.name}</td>
                  <td className="px-6 py-4">{a.scan_time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[a.status] || ''}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
