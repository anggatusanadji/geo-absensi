import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, Image, AlertCircle } from 'lucide-react';

interface CameraSelfieProps {
  onCapture: (photoDataUrl: string | null) => void;
  photoUrl?: string;
}

export const CameraSelfie: React.FC<CameraSelfieProps> = ({ onCapture, photoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(photoUrl || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const startCamera = async () => {
    setIsStarting(true);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access prevented or not available:', err);
      setCameraError('Kamera tidak tersedia atau izin ditolak. Menggunakan selfie simulasi presensi.');
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (!captured) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCaptured(dataUrl);
        onCapture(dataUrl);
        stopCamera();
      }
    } else {
      // Fallback sample photo if video canvas unavailable
      const fallbackSample = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
      setCaptured(fallbackSample);
      onCapture(fallbackSample);
    }
  };

  const retake = () => {
    setCaptured(null);
    onCapture(null);
    startCamera();
  };

  const useSamplePhoto = () => {
    const sample = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';
    setCaptured(sample);
    onCapture(sample);
    stopCamera();
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-md flex items-center justify-center">
        {captured ? (
          <div className="relative w-full h-full">
            <img src={captured} alt="Verifikasi Selfie" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
            </div>
          </div>
        ) : stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="p-4 text-center text-slate-300 flex flex-col items-center gap-2">
            {cameraError ? (
              <>
                <AlertCircle className="w-8 h-8 text-amber-400" />
                <p className="text-xs text-slate-200">{cameraError}</p>
                <button
                  type="button"
                  onClick={useSamplePhoto}
                  className="mt-2 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium transition"
                >
                  Gunakan Selfie Standar
                </button>
              </>
            ) : (
              <>
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="text-xs">Membuka Kamera...</span>
              </>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex items-center gap-2">
        {captured ? (
          <button
            type="button"
            onClick={retake}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Ambil Ulang Photo
          </button>
        ) : stream ? (
          <button
            type="button"
            onClick={takePhoto}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md"
          >
            <Camera className="w-4 h-4" /> Ambil Foto Selfie
          </button>
        ) : (
          <button
            type="button"
            onClick={useSamplePhoto}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
          >
            <Image className="w-3.5 h-3.5" /> Pilih Selfie Demo
          </button>
        )}
      </div>
    </div>
  );
};
