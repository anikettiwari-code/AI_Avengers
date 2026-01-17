import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ScanFace, Camera, CheckCircle, AlertCircle, Users, RefreshCw } from 'lucide-react';
import { FaceAuthService, FaceMatchResult } from '../../services/FaceAuthService';
import { useSession } from '../../context/SessionContext';

export const ClassroomScan = () => {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<FaceMatchResult[] | null>(null);
  const { markAttendance } = useSession();

  const captureAndScan = useCallback(async () => {
    if (!webcamRef.current) return;
    
    setIsScanning(true);
    setResults(null);

    try {
        // In a real app, we'd grab the screenshot: const imageSrc = webcamRef.current.getScreenshot();
        // And pass it to the service.
        
        const matches = await FaceAuthService.getInstance().scanClassroom(webcamRef.current.video!);
        
        setResults(matches);
        
        // Auto-mark attendance for found students
        matches.forEach(match => {
            markAttendance(match.studentId);
        });

    } catch (err) {
        console.error("Scan failed", err);
    } finally {
        setIsScanning(false);
    }
  }, [markAttendance]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classroom Optical Scanner</h1>
          <p className="text-slate-500 text-sm">AI-powered crowd scanning for rapid attendance.</p>
        </div>
        <div className="flex gap-2">
            <Badge variant="info" className="animate-pulse">
                <ScanFace className="w-3 h-3 mr-1" /> AI Engine Ready
            </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Camera Feed */}
        <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden relative shadow-2xl">
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "environment" }} // Use back camera on mobile
            />
            
            {/* Scanning Overlay */}
            {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/10 z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] animate-[scan_2s_ease-in-out_infinite]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-full font-mono text-sm border border-emerald-500/30 flex items-center gap-3">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            PROCESSING NEURAL NETWORK...
                        </div>
                    </div>
                </div>
            )}

            {/* Results Overlay (Bounding Boxes Simulation) */}
            {!isScanning && results && (
                <div className="absolute inset-0 pointer-events-none">
                    {results.map((res, idx) => (
                        <div 
                            key={idx}
                            className="absolute border-2 border-emerald-400 bg-emerald-400/20 rounded-lg flex flex-col items-center justify-end pb-1"
                            style={{
                                left: `${20 + (idx * 25)}%`, // Mock positioning
                                top: '30%',
                                width: '15%',
                                height: '25%'
                            }}
                        >
                            <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 shadow-sm">
                                {res.studentId === 'S-101' ? 'Narendra' : `Student ${res.studentId.split('-')[1]}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-20">
                <Button 
                    size="lg" 
                    onClick={captureAndScan} 
                    disabled={isScanning}
                    className="rounded-full px-8 h-14 bg-white text-slate-900 hover:bg-slate-100 border-none shadow-xl"
                >
                    <Camera className="w-6 h-6 mr-2" />
                    {isScanning ? 'Scanning...' : 'Scan Class'}
                </Button>
            </div>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col gap-4">
            <GlassCard className="flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Detected Students
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-3">
                    {!results && !isScanning && (
                        <div className="text-center text-slate-400 py-10">
                            <ScanFace className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Point camera at students and click Scan.</p>
                        </div>
                    )}

                    {results && results.map((res, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                                {res.studentId.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">
                                    {res.studentId === 'S-101' ? 'Narendra Suthar' : `Student ${res.studentId}`}
                                </p>
                                <p className="text-xs text-emerald-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Verified (98%)
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            <GlassCard className="bg-slate-900 text-white border-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Unrecognized</p>
                        <p className="text-2xl font-bold">0 Faces</p>
                    </div>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
};
