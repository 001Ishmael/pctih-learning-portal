import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, CheckCircle2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Enrollment } from '../../lib/types';

declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => {
      detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
    };
  }
}

export default function WorkshopCheckIn() {
  const { profile } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [lastResult, setLastResult] = useState<{ name: string; workshop: string; time: string } | null>(null);
  const [supportsCamera, setSupportsCamera] = useState(true);

  useEffect(() => {
    setSupportsCamera(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      scanLoop();
    } catch {
      toast.error('Could not access camera. Use manual entry below.');
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | undefined;
    stream?.getTracks().forEach((t) => t.stop());
    setScanning(false);
  }

  function scanLoop() {
    if (!window.BarcodeDetector || !videoRef.current) return;
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          clearInterval(interval);
          stopCamera();
          checkIn(codes[0].rawValue);
        }
      } catch {
        // ignore transient detection errors
      }
    }, 500);
  }

  async function checkIn(enrollmentId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, workshops(*), profiles(*)')
      .eq('id', enrollmentId.trim())
      .maybeSingle();

    const enrollment = data as Enrollment | null;
    if (error || !enrollment || enrollment.registerable_type !== 'workshop') {
      toast.error('Invalid or unrecognized check-in code.');
      return;
    }
    if (enrollment.status !== 'active') {
      toast.error(`This registration is "${enrollment.status.replace('_', ' ')}" — cannot check in.`);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const { error: attError } = await supabase
      .from('attendance')
      .upsert({ enrollment_id: enrollment.id, session_date: today, status: 'present', marked_by: profile?.id }, { onConflict: 'enrollment_id,session_date' });

    if (attError) {
      toast.error('Could not record check-in.');
      return;
    }

    setLastResult({
      name: enrollment.profiles?.full_name ?? 'Student',
      workshop: enrollment.workshops?.title ?? 'Workshop',
      time: new Date().toLocaleTimeString(),
    });
    toast.success('Checked in successfully!');
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualId.trim()) return;
    checkIn(manualId.trim());
    setManualId('');
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-navy mb-2">Workshop Check-In</h1>
      <p className="text-gray-500 mb-6">Scan a student's QR code or enter their enrollment ID to check them in.</p>

      {supportsCamera ? (
        <div className="card p-5 mb-6">
          <video ref={videoRef} className={`w-full rounded-lg bg-black ${scanning ? '' : 'hidden'}`} muted playsInline />
          {!scanning && (
            <button onClick={startCamera} className="btn-primary w-full">
              <Camera className="h-4 w-4" /> Start Camera Scan
            </button>
          )}
          {scanning && (
            <button onClick={stopCamera} className="btn-outline w-full mt-3">Stop Scanning</button>
          )}
        </div>
      ) : (
        <div className="card p-4 mb-6 bg-amber-50 border-amber-200 text-sm text-amber-800">
          Camera-based QR scanning isn't supported in this browser. Use manual entry below, or open this page in a
          recent version of Chrome on Android/Desktop.
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="card p-5 flex gap-2 mb-6">
        <input
          className="input"
          placeholder="Paste or type enrollment ID..."
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
        />
        <button type="submit" className="btn-primary whitespace-nowrap"><Search className="h-4 w-4" /> Check In</button>
      </form>

      {lastResult && (
        <div className="card p-5 flex items-start gap-3 bg-green-50 border-green-200">
          <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-navy">{lastResult.name} checked in</p>
            <p className="text-sm text-gray-600">{lastResult.workshop} · {lastResult.time}</p>
          </div>
        </div>
      )}
    </div>
  );
}
