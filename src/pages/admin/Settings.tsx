import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Shield, Bell, Lock, Eye, Database, Save } from 'lucide-react';

export const Settings = () => {
  const [biometricStrict, setBiometricStrict] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Configuration</h1>
          <p className="text-slate-500 text-sm">Manage security protocols and global preferences.</p>
        </div>
        <Button>
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      <GlassCard className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="text-primary-600 w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-800">Security Protocols</h3>
        </div>

        <div className="space-y-4">
          <SettingToggle 
            title="Strict Biometric Enforcement" 
            desc="Require Face ID + Geofence for all attendance actions."
            active={biometricStrict}
            onToggle={() => setBiometricStrict(!biometricStrict)}
            icon={Eye}
          />
          <SettingToggle 
            title="Device Hardware Lock" 
            desc="Bind student accounts to a single device ID to prevent proxy."
            active={true}
            onToggle={() => {}}
            icon={Lock}
          />
        </div>
      </GlassCard>

      <GlassCard className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-amber-500 w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h4 className="font-semibold text-slate-800 mb-2">Email Alerts</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                Attendance Defaulter Warning
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                System Downtime Alerts
              </label>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h4 className="font-semibold text-slate-800 mb-2">Push Notifications</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                Class Start Reminders
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded text-primary-600" />
                New Grade Posted
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="border-red-100 bg-red-50/30">
        <div className="flex items-center gap-2 mb-4">
          <Database className="text-red-500 w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-800">Data Management</h3>
        </div>
        <div className="flex justify-between items-center">
          <div>
             <p className="font-semibold text-slate-800">Purge Academic Year Data</p>
             <p className="text-xs text-slate-500">This action cannot be undone. Archives will be created.</p>
          </div>
          <Button variant="danger" size="sm">Execute Purge</Button>
        </div>
      </GlassCard>
    </div>
  );
};

const SettingToggle = ({ title, desc, active, onToggle, icon: Icon }: any) => (
  <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white/50 hover:bg-white transition-colors">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-lg ${active ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 max-w-md">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-primary-600' : 'bg-slate-300'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : ''}`}></div>
    </button>
  </div>
);
