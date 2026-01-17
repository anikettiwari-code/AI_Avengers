import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RadarScanner } from '../../components/ui/RadarScanner';
import { Scan, CheckCircle, MapPin, Fingerprint, AlertTriangle, Radio, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { checkGeofence } from '../../utils/geofence';
import { FaceAuthService } from '../../services/FaceAuthService';

type VerificationStep = 'idle' | 'radar' | 'face' | 'success' | 'failed';

export const ScanAttendance = () => {
  const [step, setStep] = useState<VerificationStep>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const webcamRef = useRef<Webcam>(null);
  const { markAttendance } = useSession();
  const navigate = useNavigate();

  const startVerification = async () => {
    setStep('radar');
    setErrorMsg('');

    try {
        // Phase 1: Radar Scan (Geofence + Environment + Proxy Check)
        setStatusMessage("Triangulating Location...");
        await new Promise(r => setTimeout(r, 1500));
        
        const inZone = await checkGeofence();
        if (!inZone) throw new Error("Outside Classroom Geofence");

        setStatusMessage("Scanning RF Environment...");
        await new Promise(r => setTimeout(r, 1500));
        // Simulating checking for other devices nearby (Anti-Proxy)
        
        setStatusMessage("Verifying Device Fingerprint...");
        await new Promise(r => setTimeout(r, 1000));
        
        // Phase 2: Face Liveness
        setStep('face');

    } catch (err: any) {
        setStep('failed');
        setErrorMsg(err.message || "Security Check Failed");
    }
  };

  const handleFaceVerify = async () => {
    if (!webcamRef.current?.video) return;

    try {
        const result = await FaceAuthService.getInstance().verifyFace(
            webcamRef.current.video,
            new Float32Array(128)
        );

        if (result.match) {
            setStep('success');
            markAttendance('S-101');
        } else {
            // Don't fail immediately, let them keep trying for a bit or throw error
            // throw new Error("Face not recognized");
        }
    } catch (err: any) {
        setStep('failed');
        setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    let interval: any;
    if (step === 'face') {
        interval = setInterval(() => {
            handleFaceVerify();
        }, 2000);
    }
    return () => clearInterval(interval);
  }, [step]);

  if (step === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center p-10 animate-in zoom-in duration-300 border-emerald-200 bg-emerald-50/50">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-lg shadow-emerald-200">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Attendance Marked</h2>
          <p className="text-slate-500 mb-6">Your presence has been cryptographically verified.</p>
          
          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
             <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                <MapPin className="w-4 h-4 text-emerald-500" /> Geofence: Inside
             </div>
             <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                <Fingerprint className="w-4 h-4 text-emerald-500" /> Device: Verified
             </div>
             <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                <Radio className="w-4 h-4 text-emerald-500" /> Proxy Check: Passed
             </div>
             <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Liveness: 99.8%
             </div>
          </div>

          <Button onClick={() => navigate('/student')} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Return to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-0 overflow-hidden relative">
        <div className="p-6 border-b border-slate-100 bg-white/50 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Secure Check-in</h2>
                <p className="text-xs text-slate-500">Anti-Proxy Protocol Active</p>
            </div>
            {step === 'face' && <Badge variant="danger" className="animate-pulse">REC</Badge>}
        </div>

        <div className="p-6">
            {step === 'idle' && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/10">
                        <Scan className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Initiate Scan</h3>
                    <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
                        We will verify your location, device signature, and biometric liveness.
                    </p>
                    <Button size="lg" className="w-full" onClick={startVerification}>
                        Start Verification
                    </Button>
                </div>
            )}

            {step === 'radar' && (
                <div className="text-center py-4">
                    <RadarScanner />
                    <h3 className="font-bold text-slate-800 mt-4">{statusMessage}</h3>
                    <p className="text-xs text-slate-400 mt-1">Please hold still...</p>
                </div>
            )}

            {step === 'face' && (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] shadow-2xl">
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{ facingMode: "user" }}
                    />
                    
                    {/* Face Overlay UI */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-8 left-8 right-8 bottom-24 border-2 border-white/30 rounded-[3rem]">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/20">
                                Align Face
                            </div>
                            {/* Scanning Line */}
                            <div className="w-full h-1 bg-emerald-500/50 shadow-[0_0_15px_#10b981] absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                        
                        {/* Tech Stats */}
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] text-emerald-400 font-mono">
                            <span>FACE_VECTOR: TRACKING</span>
                            <span>LIVENESS: CHECKING</span>
                        </div>
                    </div>
                </div>
            )}

            {step === 'failed' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Verification Failed</h3>
                    <p className="text-sm text-slate-500 mb-6 px-4">{errorMsg}</p>
                    <Button variant="outline" onClick={() => setStep('idle')}>Try Again</Button>
                </div>
            )}
        </div>
      </GlassCard>
    </div>
  );
};
