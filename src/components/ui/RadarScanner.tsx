import React from 'react';
import { motion } from 'framer-motion';

export const RadarScanner = () => {
  return (
    <div className="relative w-64 h-64 mx-auto my-8">
      {/* Outer Ring */}
      <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 bg-emerald-500/5"></div>
      
      {/* Middle Ring */}
      <div className="absolute inset-8 rounded-full border border-emerald-500/30"></div>
      
      {/* Inner Ring */}
      <div className="absolute inset-20 rounded-full border border-emerald-500/40 bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
      </div>

      {/* Crosshairs */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-full h-px bg-emerald-500"></div>
        <div className="h-full w-px bg-emerald-500 absolute"></div>
      </div>

      {/* Sweeping Radar Line */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-full h-1/2 bg-gradient-to-r from-transparent via-emerald-500/10 to-emerald-500/40 border-b border-emerald-500/50 origin-bottom transform rotate-180"></div>
      </motion.div>

      {/* Detected "Blips" (Simulating devices/people) */}
      <motion.div 
        className="absolute top-10 right-10 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div 
        className="absolute bottom-16 left-12 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      />
    </div>
  );
};
