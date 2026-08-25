'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export default function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  const [status, setStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const isMounted = useRef(false);
  const isScanning = useRef(false);

  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    // Guard against double-invocation from React Strict Mode
    if (isMounted.current) return;
    isMounted.current = true;

    const qrScannerId = 'qr-reader-direct';
    let scanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode(qrScannerId);

        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          throw new Error('Tidak ada kamera yang terdeteksi.');
        }

        // Prefer back camera on mobile
        const cameraId =
          devices.find(d => d.label.toLowerCase().includes('back'))?.id ||
          devices[0].id;

        await scanner.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!isScanning.current) {
              isScanning.current = true;
              onScanSuccessRef.current(decodedText);
              setTimeout(() => { isScanning.current = false; }, 2500);
            }
          },
          (errorMessage) => {
            if (onScanError) {
              onScanError(errorMessage);
            }
          } // Call onScanError if provided
        );

        setStatus('active');
      } catch (err: any) {
        const msg = err?.message || 'Gagal mengakses kamera.';
        setErrorMsg(msg);
        setStatus('error');
      }
    };

    startScanner();

    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        id="qr-reader-direct"
        className="overflow-hidden rounded-lg border-2 border-slate-200 bg-black min-h-[300px] flex items-center justify-center"
      />

      {status === 'loading' && (
        <p className="text-center text-sm text-slate-500 mt-3 animate-pulse">
          Menghubungkan ke kamera...
        </p>
      )}

      {status === 'active' && (
        <p className="text-center text-sm text-green-600 mt-3 font-medium">
          ✅ Kamera aktif — Arahkan QR Code siswa ke area kotak.
        </p>
      )}

      {status === 'error' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm text-red-700 font-medium">Kamera tidak dapat diakses</p>
          <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
          <p className="text-xs text-slate-500 mt-2">
            Klik ikon 🔒 di address bar → izinkan kamera → refresh halaman.
          </p>
        </div>
      )}
    </div>
  );
}
