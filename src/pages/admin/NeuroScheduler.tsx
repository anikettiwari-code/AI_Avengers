import React, { useState } from 'react';
import { Upload, Cpu, Zap, Calendar, ScanLine, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GroqService, ParsedScheduleItem } from '../../services/GroqService';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

const TerminalLog = ({ logs }: { logs: string[] }) => (
  <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto shadow-inner border border-slate-800">
    <div className="space-y-1">
        {logs.map((log, i) => (
        <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2"
        >
            <span className="text-blue-400 shrink-0">➜</span>
            <span className="break-all">{log}</span>
        </motion.div>
        ))}
        {logs.length === 0 && <span className="text-slate-500">System Ready. Waiting for input...</span>}
    </div>
  </div>
);

export const NeuroScheduler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<ParsedScheduleItem[] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleFileDrop = async (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    let file: File | undefined;
    if ('dataTransfer' in e) {
        file = e.dataTransfer.files[0];
    } else {
        file = e.target.files?.[0];
    }

    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setImagePreview(base64);
            processImage(base64);
        };
        reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64Image: string) => {
    setIsProcessing(true);
    setLogs([]);
    setParsedData(null);
    
    addLog("Initializing Groq Vision Core (Llama 3.2)...");
    addLog("Uploading image buffer...");

    try {
        addLog("Sending to Neural Engine...");
        const result = await GroqService.getInstance().parseTimetableImage(base64Image);
        
        addLog(`Analysis Complete. Found ${result.length} schedule entries.`);
        addLog("Structure verification passed.");
        setParsedData(result);

    } catch (error: any) {
        addLog(`ERROR: ${error.message}`);
    } finally {
        setIsProcessing(false);
    }
  };

  const saveToDatabase = async () => {
    if (!parsedData) return;
    
    addLog("Initiating Database Sync...");
    
    try {
        // Map parsed data to DB schema
        const inserts = parsedData.map(item => ({
            code: item.code,
            name: item.name,
            schedule: `${item.day} ${item.time} (${item.room})`,
            credits: 3 // Default
        }));

        const { error } = await supabase.from('courses').insert(inserts);
        
        if (error) throw error;
        
        addLog("SUCCESS: Schedule data committed to Supabase.");
        alert("Timetable imported successfully!");
    } catch (err: any) {
        addLog(`DB WRITE ERROR: ${err.message}`);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Cpu className="w-6 h-6" />
          </div>
          Neuro-Scheduler <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">LIVE</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          AI-Powered Timetable Parser. Powered by <span className="font-bold text-slate-700">Groq Llama 3.2 Vision</span>.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Input */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload Source
            </h3>
            
            <div 
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
              `}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
            >
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileDrop} accept="image/*" />
              
              {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <ScanLine className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-slate-700 font-bold">Drop Timetable Image</p>
                    <p className="text-xs text-slate-400 mt-2">
                        PNG, JPG (Max 5MB)
                    </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-500" />
              Controls
            </h3>
            <div className="space-y-4">
              <Button 
                className="w-full" 
                disabled={!parsedData || isProcessing}
                onClick={saveToDatabase}
              >
                <Save className="w-4 h-4 mr-2" /> Save to Database
              </Button>
            </div>
          </div>
        </div>

        {/* Right Col: Output */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
             <div className="absolute -top-3 left-4 bg-slate-800 px-2 text-[10px] font-mono text-slate-200 rounded z-20">
                GROQ_ENGINE_LOG
             </div>
             <TerminalLog logs={logs} />
          </div>

          <AnimatePresence>
            {parsedData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
              >
                <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="text-blue-600" />
                      Extracted Schedule
                    </h3>
                  </div>

                  <div className="grid gap-3">
                    {parsedData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-800">{item.code}: {item.name}</p>
                                <p className="text-xs text-slate-500">{item.teacher}</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold mb-1">
                                    {item.day} {item.time}
                                </div>
                                <p className="text-xs text-slate-500">{item.room}</p>
                            </div>
                        </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
