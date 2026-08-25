'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';

interface RecentAttendance {
  id: string;
  scan_time: string;
  status: string;
  students: { full_name: string };
  attendance_sessions: { classes: { name: string } };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalSiswa: 0, hadir: 0, terlambat: 0, belumHadir: 0 });
  const [recent, setRecent] = useState<RecentAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0];

      // Total siswa aktif
      const { count: totalSiswa } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

      // Hadir hari ini
      const { count: hadir } = await supabase
        .from('attendances')
        .select('*, attendance_sessions!inner(attendance_date)', { count: 'exact', head: true })
        .eq('status', 'HADIR')
        .eq('attendance_sessions.attendance_date', today);

      // Terlambat hari ini
      const { count: terlambat } = await supabase
        .from('attendances')
        .select('*, attendance_sessions!inner(attendance_date)', { count: 'exact', head: true })
        .eq('status', 'TERLAMBAT')
        .eq('attendance_sessions.attendance_date', today);

      setStats({
        totalSiswa: totalSiswa || 0,
        hadir: hadir || 0,
        terlambat: terlambat || 0,
        belumHadir: (totalSiswa || 0) - (hadir || 0) - (terlambat || 0),
      });

      // Absensi terbaru (10 data)
      const { data: recentData } = await supabase
        .from('attendances')
        .select('id, scan_time, status, students(full_name), attendance_sessions(classes(name))')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentData) setRecent(recentData as any);
      setLoading(false);
    };

    fetchData();
  }, []);

  const statusColors: Record<string, string> = {
    HADIR: 'bg-green-50 text-green-700',
    TERLAMBAT: 'bg-amber-50 text-amber-700',
    IZIN: 'bg-blue-50 text-blue-700',
    SAKIT: 'bg-slate-100 text-slate-600',
    ALPA: 'bg-red-50 text-red-700',
  };

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Dashboard" />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Overview</h2>
          <p className="text-sm text-slate-500">Ringkasan data absensi hari ini</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Total Siswa</h3>
            <p className="text-2xl font-bold text-slate-800 mt-2">{loading ? '...' : stats.totalSiswa}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Hadir Hari Ini</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">{loading ? '...' : stats.hadir}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Terlambat</h3>
            <p className="text-2xl font-bold text-amber-600 mt-2">{loading ? '...' : stats.terlambat}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Belum Hadir</h3>
            <p className="text-2xl font-bold text-red-600 mt-2">{loading ? '...' : Math.max(0, stats.belumHadir)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Absensi Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Siswa</th>
                  <th className="px-4 py-3 font-medium">Kelas</th>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Memuat...</td></tr>
                ) : recent.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada data absensi hari ini.</td></tr>
                ) : recent.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.students?.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">{(a.attendance_sessions as any)?.classes?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{a.scan_time}</td>
                    <td className="px-4 py-3">
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
      </div>
    </>
  );
}
