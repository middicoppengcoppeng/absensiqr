'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import QrScanner from '@/components/scanner/QrScanner';
import { CheckCircle2, AlertCircle, Clock, ChevronDown, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ScanResult {
  id: string;
  name: string;
  class: string;
  time: string;
  status: 'HADIR' | 'TERLAMBAT' | 'ERROR';
}

interface ActiveSession {
  id: string;
  attendance_date: string;
  start_time: string;
  end_time: string;
  late_after: string;
  class_id: string;
  classes: { name: string };
}

let audioCtx: AudioContext | null = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const playBeepSuccess = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) { console.error('Audio error', e); }
};

const playBeepError = () => {
  try {
    const ctx = getAudioCtx();
    [0, 0.25].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + offset + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.18);
    });
  } catch (e) { console.error('Audio error', e); }
};

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [sessionLoading, setSessionLoading] = useState(true);

  const selectedSession = sessions.find(s => s.id === selectedSessionId) || null;

  const fetchActiveSessions = async () => {
    setSessionLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*, classes(name)')
      .eq('status', 'ACTIVE')
      .eq('attendance_date', today)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setSessions(data as any);
      // Auto-select first session only if none selected yet
      setSelectedSessionId(prev => prev || data[0].id);
    } else {
      setSessions([]);
      setSelectedSessionId('');
    }
    setSessionLoading(false);
  };

  useEffect(() => {
    const unlockAudio = () => {
      try {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) {
        console.error('Failed to unlock audio', e);
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    fetchActiveSessions();

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const handleScanSuccess = async (decodedText: string) => {
    if (!selectedSessionId) {
      playBeepError();
      setError('Pilih sesi absensi terlebih dahulu sebelum scan.');
      return;
    }

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_token: decodedText, session_id: selectedSessionId })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playBeepSuccess();
        const newScan: ScanResult = {
          id: decodedText,
          name: data.data.student_name,
          class: data.data.class,
          time: data.data.time,
          status: data.data.status as any
        };
        setScanResult(newScan);
        setRecentScans(prev => [newScan, ...prev].slice(0, 5));
        setError(null);
      } else {
        playBeepError();
        setError(data.message || 'QR Code tidak valid atau ditolak.');
        setScanResult(null);
      }
    } catch (err) {
      playBeepError();
      setError('Koneksi bermasalah. Silakan coba kembali.');
      setScanResult(null);
    }
  };

  const handleScanError = (errorMessage: string) => {
    if (!errorMessage.includes('NotFound')) {
      console.log(errorMessage);
    }
  };

  return (
    <>
      <div className="-m-4 md:-m-8 mb-4 md:mb-8">
        <Header title="Scan Absensi" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scanner Section */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="mb-6 border-b border-slate-100 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Scan QR Code Siswa</h2>
                <button
                  onClick={playBeepSuccess}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200"
                >
                  🔊 Test Suara
                </button>
              </div>

              {/* Session Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Sesi Absensi
                </label>
                {sessionLoading ? (
                  <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ) : sessions.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 font-medium">Belum ada sesi aktif hari ini</p>
                    <button
                      onClick={fetchActiveSessions}
                      className="ml-auto text-red-600 hover:text-red-800"
                      title="Refresh"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={selectedSessionId}
                        onChange={e => {
                          setSelectedSessionId(e.target.value);
                          setScanResult(null);
                          setError(null);
                          setRecentScans([]);
                        }}
                        className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      >
                        {sessions.map(s => (
                          <option key={s.id} value={s.id}>
                            Kelas {s.classes?.name} &nbsp;•&nbsp; {s.start_time} - {s.end_time}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={fetchActiveSessions}
                      className="p-2.5 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                      title="Refresh sesi"
                    >
                      <RefreshCw size={15} />
                    </button>
                  </div>
                )}

                {/* Session detail badge */}
                {selectedSession && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                      📚 Kelas {selectedSession.classes?.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full">
                      ⏰ {selectedSession.start_time} – {selectedSession.end_time}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                      🕐 Terlambat setelah {selectedSession.late_after}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <QrScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">

          {/* Active Result Card */}
          {scanResult && (
            <div className={`p-6 rounded-lg border shadow-sm ${
              scanResult.status === 'HADIR' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {scanResult.status === 'HADIR' ? (
                  <CheckCircle2 className="text-green-600" size={28} />
                ) : (
                  <Clock className="text-amber-600" size={28} />
                )}
                <h3 className={`text-lg font-bold ${
                  scanResult.status === 'HADIR' ? 'text-green-800' : 'text-amber-800'
                }`}>
                  ABSEN BERHASIL
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Nama</span>
                  <span className="font-bold text-slate-800">{scanResult.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kelas</span>
                  <span className="font-medium text-slate-800">{scanResult.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jam</span>
                  <span className="font-medium text-slate-800">{scanResult.time}</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-black/5">
                  <span className="text-slate-600">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    scanResult.status === 'HADIR'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-amber-200 text-amber-800'
                  }`}>
                    {scanResult.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0" size={20} />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Recent Scans */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Scan Terbaru</h3>
              {recentScans.length > 0 && (
                <span className="text-xs text-slate-400">{recentScans.length} data</span>
              )}
            </div>

            {recentScans.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-500">
                Belum ada data scan
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentScans.map((scan, idx) => (
                  <li key={idx} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{scan.name}</p>
                      <p className="text-xs text-slate-500">{scan.class} • {scan.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      scan.status === 'HADIR'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {scan.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
