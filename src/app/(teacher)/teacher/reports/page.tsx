'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';
import { Download, Users, ClipboardList, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useConfirm } from '@/hooks/useConfirm';

interface ClassData {
  id: string;
  name: string;
}

interface StudentRecord {
  student_name: string;
  nis: string;
  class_name: string;
  status: string;
  scan_time: string;
}

interface SessionData {
  id: string;
  start_time: string;
  class_id: string;
}

interface StudentData {
  id: string;
  full_name: string;
  nis: string;
  class_id: string;
}

export default function TeacherReportsPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState('ALL');

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('ALL');
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);

  // Manual entry modal state
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [alreadyAttendedIds, setAlreadyAttendedIds] = useState<Set<string>>(new Set());
  const [manualForm, setManualForm] = useState({
    session_id: '',
    student_id: '',
    status: 'IZIN',
    notes: '',
  });

  const { showAlert, ConfirmElement } = useConfirm();

  useEffect(() => {
    const fetchClasses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('classes')
        .select('id, name')
        .eq('homeroom_teacher_id', user.id)
        .order('name');
      if (data) setClasses(data);
    };
    fetchClasses();
  }, []);

  // Load sessions & students when manual modal opens
  useEffect(() => {
    if (!isManualOpen) return;
    const load = async () => {
      const { data: sess } = await supabase
        .from('attendance_sessions')
        .select('id, start_time, class_id')
        .eq('attendance_date', selectedDate)
        .order('start_time');
      if (sess) setSessions(sess);

      const { data: studs } = await supabase
        .from('students')
        .select('id, full_name, nis, class_id')
        .eq('status', 'ACTIVE')
        .order('full_name');
      if (studs) setAllStudents(studs);
    };
    load();
  }, [isManualOpen, selectedDate]);

  useEffect(() => {
    fetchRecords();
  }, [selectedClass, selectedDate, selectedSessionFilter]);

  const fetchRecords = async () => {
    setLoading(true);

    // Step 1: Get session IDs that match the date & class filter
    let sessionQuery = supabase
      .from('attendance_sessions')
      .select('id, class_id, start_time, end_time, classes ( name )')
      .eq('attendance_date', selectedDate)
      .order('start_time');

    // If teacher hasn't selected a specific class, we need to filter sessions to ONLY their classes
    if (selectedClass !== 'ALL') {
      sessionQuery = sessionQuery.eq('class_id', selectedClass);
    } else {
      const classIds = classes.map(c => c.id);
      if (classIds.length === 0) {
        setRecords([]);
        setLoading(false);
        return;
      }
      sessionQuery = sessionQuery.in('class_id', classIds);
    }

    const { data: sessionData } = await sessionQuery;
    setAvailableSessions(sessionData || []);
    
    let sessionIds = sessionData?.map((s: any) => s.id) || [];

    if (selectedSessionFilter !== 'ALL') {
      sessionIds = sessionIds.filter(id => id === selectedSessionFilter);
    }

    if (sessionIds.length === 0) {
      setRecords([]);
      setLoading(false);
      return;
    }

    // Build a map of session_id -> class name for lookup
    const sessionClassMap: Record<string, string> = {};
    (sessionData || []).forEach((s: any) => {
      sessionClassMap[s.id] = s.classes?.name || '-';
    });

    // Step 2: Fetch attendances for those sessions
    const { data, error } = await supabase
      .from('attendances')
      .select(`
        status,
        scan_time,
        session_id,
        students ( full_name, nis )
      `)
      .in('session_id', sessionIds);

    if (!error && data) {
      const mapped: StudentRecord[] = (data as any[]).map((a) => ({
        student_name: a.students?.full_name || '-',
        nis: a.students?.nis || '-',
        class_name: sessionClassMap[a.session_id] || '-',
        status: a.status,
        scan_time: a.scan_time || '-',
      }));
      setRecords(mapped);
    }
    setLoading(false);
  };

  // Filtered students based on selected session's class, excluding already attended
  const selectedSession = sessions.find(s => s.id === manualForm.session_id);
  const filteredStudentsForManual = selectedSession
    ? allStudents.filter(s => s.class_id === selectedSession.class_id)
    : allStudents;

  // Fetch already-attended students when session changes
  const handleSessionChange = async (session_id: string) => {
    setManualForm(prev => ({ ...prev, session_id, student_id: '' }));
    if (!session_id) { setAlreadyAttendedIds(new Set()); return; }
    const { data } = await supabase
      .from('attendances')
      .select('student_id')
      .eq('session_id', session_id);
    if (data) setAlreadyAttendedIds(new Set(data.map((a: any) => a.student_id)));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.session_id || !manualForm.student_id) return;
    setIsSubmitting(true);

    try {
      const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
      const { error } = await supabase.from('attendances').insert([{
        session_id: manualForm.session_id,
        student_id: manualForm.student_id,
        status: manualForm.status,
        notes: manualForm.notes || null,
        scan_time: now,
      }]);

      if (error) {
        if (error.code === '23505') {
          // Unique constraint: update existing record instead
          const { error: updateError } = await supabase
            .from('attendances')
            .update({ status: manualForm.status, notes: manualForm.notes || null })
            .eq('session_id', manualForm.session_id)
            .eq('student_id', manualForm.student_id);
          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }

      setIsManualOpen(false);
      setManualForm({ session_id: '', student_id: '', status: 'IZIN', notes: '' });
      fetchRecords();
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Gagal menyimpan absensi manual.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const grouped: Record<string, StudentRecord[]> = {
    HADIR: records.filter(r => r.status === 'HADIR'),
    TERLAMBAT: records.filter(r => r.status === 'TERLAMBAT'),
    IZIN: records.filter(r => r.status === 'IZIN'),
    SAKIT: records.filter(r => r.status === 'SAKIT'),
    ALPA: records.filter(r => r.status === 'ALPA'),
  };

  const total = records.length;

  const exportToExcel = () => {
    if (records.length === 0) return;

    const statusLabel: Record<string, string> = {
      HADIR: 'Hadir', TERLAMBAT: 'Terlambat', IZIN: 'Izin', SAKIT: 'Sakit', ALPA: 'Alpa',
    };

    const rows = records.map((r, i) => ({
      'No': i + 1,
      'Nama Siswa': r.student_name,
      'NIS': r.nis,
      'Kelas': r.class_name,
      'Status': statusLabel[r.status] || r.status,
      'Jam Scan': r.scan_time === '-' ? '-' : r.scan_time,
      'Tanggal': selectedDate,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Absensi');

    const fileName = `Laporan_Absensi_${selectedDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const statusConfig = [
    { key: 'HADIR',     label: 'Hadir',     color: 'text-green-700', bg: 'bg-green-50 border-green-200',   headerBg: 'bg-green-600' },
    { key: 'TERLAMBAT', label: 'Terlambat', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200',   headerBg: 'bg-amber-500' },
    { key: 'IZIN',      label: 'Izin',      color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200',     headerBg: 'bg-blue-600'  },
    { key: 'SAKIT',     label: 'Sakit',     color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200',   headerBg: 'bg-slate-500' },
    { key: 'ALPA',      label: 'Alpa',      color: 'text-red-700',   bg: 'bg-red-50 border-red-200',       headerBg: 'bg-red-600'   },
  ];

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Laporan Absensi" />
      </div>

      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-800">Rekap Kehadiran Harian</h2>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSessionFilter('ALL');
              }}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
            />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSessionFilter('ALL');
              }}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white max-w-[200px]"
            >
              <option value="ALL">Semua Kelas Saya</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={selectedSessionFilter}
              onChange={(e) => setSelectedSessionFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white max-w-[200px]"
            >
              <option value="ALL">Semua Sesi</option>
              {availableSessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.start_time.substring(0, 5)} - {s.classes?.name || 'Sesi'}
                </option>
              ))}
            </select>
            <button
              onClick={exportToExcel}
              disabled={records.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} /> Export Excel
            </button>
            <button
              onClick={() => setIsManualOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <ClipboardList size={16} /> Input Manual
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statusConfig.map(s => (
            <div key={s.key} className={`p-5 rounded-lg border shadow-sm ${s.bg}`}>
              <h3 className="text-sm font-medium text-slate-600">{s.label}</h3>
              <p className={`text-3xl font-bold mt-2 ${s.color}`}>
                {loading ? '...' : grouped[s.key].length}
              </p>
              {!loading && total > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {((grouped[s.key].length / total) * 100).toFixed(1)}% dari total
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Detail Siswa per Status */}
        {loading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
            Memuat data...
          </div>
        ) : total === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500">
            <Users size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Tidak ada data absensi</p>
            <p className="text-sm mt-1">Untuk tanggal dan kelas yang dipilih.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {statusConfig.map(s => (
              <div key={s.key} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className={`px-4 py-3 ${s.headerBg} flex items-center justify-between`}>
                  <h3 className="font-semibold text-white text-sm">{s.label}</h3>
                  <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {grouped[s.key].length} siswa
                  </span>
                </div>
                {grouped[s.key].length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">
                    Tidak ada siswa
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {grouped[s.key].map((r, idx) => (
                      <li key={idx} className="px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{r.student_name}</p>
                          <p className="text-xs text-slate-400">{r.nis} &middot; {r.class_name}</p>
                        </div>
                        {r.scan_time && r.scan_time !== '-' && (
                          <span className="text-xs text-slate-500 shrink-0 font-mono">
                            {r.scan_time.slice(0, 5)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {!loading && total > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 mb-1">Total Catatan Absensi</h3>
              <p className="text-sm text-slate-500">Jumlah data absensi pada tanggal dan kelas yang dipilih.</p>
            </div>
            <p className="text-4xl font-bold text-slate-800">{total}</p>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {isManualOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800">Input Absensi Manual</h3>
              <button onClick={() => setIsManualOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sesi Absensi</label>
                {sessions.length === 0 ? (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                    Tidak ada sesi pada tanggal {selectedDate}. Buat sesi terlebih dahulu.
                  </p>
                ) : (
                  <select
                    required
                    value={manualForm.session_id}
                    onChange={e => handleSessionChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="" disabled>Pilih Sesi</option>
                    {sessions.map(s => {
                      const cls = classes.find(c => c.id === s.class_id);
                      return (
                        <option key={s.id} value={s.id}>
                          {cls?.name || 'Semua'} — mulai {s.start_time?.slice(0, 5)}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Siswa</label>
                <select
                  required
                  value={manualForm.student_id}
                  onChange={e => setManualForm({ ...manualForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  disabled={!manualForm.session_id}
                >
                  <option value="" disabled>Pilih Siswa</option>
                  {filteredStudentsForManual.map(s => {
                    const isAttended = alreadyAttendedIds.has(s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.nis}) {isAttended ? ' - (Ubah Data)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, status: s })}
                      className={`flex-1 min-w-[80px] py-2 px-2 rounded-md text-xs sm:text-sm font-medium border transition-colors ${
                        manualForm.status === s
                          ? s === 'HADIR' ? 'bg-green-600 text-white border-green-600'
                            : s === 'TERLAMBAT' ? 'bg-amber-500 text-white border-amber-500'
                            : s === 'IZIN' ? 'bg-blue-600 text-white border-blue-600'
                            : s === 'SAKIT' ? 'bg-slate-600 text-white border-slate-600'
                            : 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
                <input
                  type="text"
                  value={manualForm.notes}
                  onChange={e => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="Contoh: Sakit demam, ada surat dokter"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || sessions.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {ConfirmElement}
    </>
  );
}
