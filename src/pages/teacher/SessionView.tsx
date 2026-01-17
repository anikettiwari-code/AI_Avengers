import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StopCircle, Wifi, Users, Maximize2 } from 'lucide-react';
import QRCode from "react-qr-code";
import { useSession } from '../../context/SessionContext';

export const SessionView = () => {
  const { qrCode, attendees, stopSession } = useSession();
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
             CS-301: Advanced AI
             <Badge variant="success" className="animate-pulse">Live Session</Badge>
           </h1>
           <p className="text-slate-500 text-sm">Session ID: #88291 • Started 15 mins ago</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Maximize2 className="w-4 h-4 mr-2" /> Projector Mode
          </Button>
          <Button variant="danger" onClick={stopSession}>
            <StopCircle className="w-4 h-4 mr-2" /> End Class
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left: QR Code */}
        <div className="col-span-4 flex flex-col">
          <GlassCard className="flex-1 flex flex-col items-center justify-center text-center bg-white/60">
            <div className="p-6 bg-white rounded-2xl shadow-xl border border-slate-100 mb-6">
               <QRCode 
                  value={qrCode || "SESSION-INIT"} 
                  size={220}
                  level="H"
               />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Scan to Mark Attendance</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs">
              Code rotates every 5 seconds. Ensure you are connected to campus Wi-Fi.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <Wifi className="w-3 h-3" /> Beacon Active
            </div>
          </GlassCard>
        </div>

        {/* Right: Student Grid */}
        <div className="col-span-8 flex flex-col">
          <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4" /> Real-time Attendance
              </h3>
              <span className="text-sm font-medium text-slate-500">
                Total: <span className="text-slate-800">{attendees.length}</span> / 60
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {attendees.map((student) => (
                  <div key={student.id} className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.time}</p>
                    </div>
                  </div>
                ))}
                {/* Empty State if no one */}
                {attendees.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-400">
                    <Users className="w-12 h-12 mb-4 opacity-20" />
                    <p>Waiting for students to join...</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
