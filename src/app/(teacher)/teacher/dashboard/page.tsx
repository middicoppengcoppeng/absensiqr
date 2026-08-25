'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface ActiveSession {
  id: string;
  attendance_date: string;
  start_time: string;
  late_after: string;
  end_time: string;
  class_id: string;
  classes: { name: string };
}

interface RecentAttendance {
  id: string;
  scan_time: string;
  status: string;
  students: { full_name: string };
}

const statusColors: Record<string, string> = {
  HADIR: 'bg-green-50 text-green-700',
  TERLAMBAT: 'bg-amber-50 text-amber-700',
  IZIN: 'bg-blue-50 text-blue-700',
  SAKIT: 'bg-slate-100 text-slate-600',
  ALPA: 'bg-red-50 text-red-700',
};

export default function TeacherDashboard() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [stats, setStats] = useState({ total: 0, hadir: 0, terlambat: 0, belum: 0 });
  const [recent, setRecent] = useState<RecentAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Get current teacher
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch teacher's classes
      const { data: cls } = await supabase
        .from('classes')
        .select('id')
        .eq('homeroom_teacher_id', user.id);
      
      const classIds = cls?.map(c => c.id) || [];

      if (classIds.length > 0) {
        // Find active session for today for their classes
        const { data: sessionData } = await supabase
          .from('attendance_sessions')
          .select('*, classes(name)')
          .eq('status', 'ACTIVE')
          .eq('attendance_date', today)
          .in('class_id', classIds)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sessionData) {
          setSession(sessionData as any);

          // Stats for this session's class
          const { count: total } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
          .eq('class_id', sessionData.class_id)
          .eq('status', 'ACTIVE');

        const { count: hadir } = await supabase
          .from('attendances')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', sessionData.id)
          .eq('status', 'HADIR');

        const { count: terlambat } = await supabase
          .from('attendances')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', sessionData.id)
          .eq('status', 'TERLAMBAT');

        const t = total || 0;
        const h = hadir || 0;
        const tl = terlambat || 0;
        setStats({ total: t, hadir: h, terlambat: tl, belum: Math.max(0, t - h - tl) });

        // Recent attendances for this session
        const { data: recentData } = await supabase
          .from('attendances')
          .select('id, scan_time, status, students(full_name)')
          .eq('session_id', sessionData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentData) setRecent(recentData as any);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Dashboard Guru" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {session ? `Sesi Aktif: ${(session as any).classes?.name}` : 'Tidak ada sesi aktif hari ini'}
            </h2>
            {session && (
              <p className="text-sm text-slate-500">
                {session.attendance_date} · {session.start_time} – {session.end_time} · Terlambat setelah {session.late_after}
              </p>
            )}
          </div>
          {session && (
            <Link href="/teacher/scan" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
              Buka Scanner QR
            </Link>
          )}
        </div>

        {!loading && !session && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-700">
            Belum ada sesi absensi aktif hari ini. Silakan buat sesi baru di menu <strong>Sesi Absensi</strong>.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Total Siswa</h3>
            <p className="text-2xl font-bold text-slate-800 mt-2">{loading ? '...' : stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Hadir</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">{loading ? '...' : stats.hadir}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Terlambat</h3>
            <p className="text-2xl font-bold text-amber-600 mt-2">{loading ? '...' : stats.terlambat}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Belum Hadir</h3>
            <p className="text-2xl font-bold text-slate-400 mt-2">{loading ? '...' : stats.belum}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Daftar Absensi Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-medium">Siswa</th>
                  <th className="px-6 py-3 font-medium">Waktu</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Memuat...</td></tr>
                ) : recent.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Belum ada absensi dalam sesi ini.</td></tr>
                ) : recent.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{a.students?.full_name}</td>
                    <td className="px-6 py-4 text-slate-600">{a.scan_time}</td>
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
      </div>
    </>
  );
}
