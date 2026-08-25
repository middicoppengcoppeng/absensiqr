'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import QrScanner from '@/components/scanner/QrScanner';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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

// Bunyi beep tinggi = sukses
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

// Bunyi tetot rendah = gagal/error (2x nada rendah)
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
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    // Unlock Web Audio API on first user interaction
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

    const fetchActiveSession = async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('attendance_sessions')
        .select('*, classes(name)')
        .eq('status', 'ACTIVE')
        .eq('attendance_date', today)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching active session:", error);
      }
      
      if (data && data.length > 0) setActiveSession(data[0] as any);
      setSessionLoading(false);
    };
    fetchActiveSession();

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const handleScanSuccess = async (decodedText: string) => {
    if (!activeSession) {
      playBeepError();
      setError("Tidak ada sesi aktif hari ini. Silakan buat sesi terlebih dahulu.");
      return;
    }

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_token: decodedText })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        playBeepSuccess(); // ✅ Bunyi beep tinggi = berhasil
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
        playBeepError(); // ❌ Bunyi tetot = gagal
        setError(data.message || "QR Code tidak valid atau ditolak.");
        setScanResult(null);
      }
    } catch (err) {
      playBeepError();
      setError("Koneksi bermasalah. Silakan coba kembali.");
      setScanResult(null);
    }
  };

  const handleScanError = (errorMessage: string) => {
    // Only log actual errors, ignore typical "no qr code found" frame errors
    if (!errorMessage.includes("NotFound")) {
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
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">Scan QR Code Siswa</h2>
              <button 
                onClick={playBeepSuccess}
                className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded mt-1 border border-slate-200"
              >
                🔊 Test Suara
              </button>
              <div className="flex gap-4 mt-2 text-sm text-slate-600">
                {sessionLoading ? (
                  <p>Memuat sesi...</p>
                ) : activeSession ? (
                  <>
                    <p>Kelas: <span className="font-semibold text-slate-800">{activeSession.classes?.name}</span></p>
                    <p>•</p>
                    <p>Sesi: <span className="font-semibold text-slate-800">{activeSession.start_time} - {activeSession.end_time}</span></p>
                  </>
                ) : (
                  <p className="text-red-600 font-medium">Belum ada sesi aktif hari ini</p>
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
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-sm">Scan Terbaru</h3>
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
                      <p className="text-xs text-slate-500">{scan.time}</p>
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
