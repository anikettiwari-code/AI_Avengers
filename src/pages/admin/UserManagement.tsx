import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Plus, MoreHorizontal, Search, Filter, Upload, ScanFace, Check, X, Loader2, RefreshCw, UserCheck } from 'lucide-react';
import { FaceAuthService } from '../../services/FaceAuthService';
import { supabase, Profile } from '../../lib/supabase';

export const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  const fetchUsers = async () => {
    setLoading(true);
    try {
        // 1. Fetch Profiles
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        // 2. Check who has face data
        const { data: faceData } = await supabase
            .from('face_encodings')
            .select('user_id');
        
        const faceMap = new Set(faceData?.map(f => f.user_id));

        const formattedUsers = profiles.map(p => ({
            ...p,
            has_face_data: faceMap.has(p.id)
        }));

        setUsers(formattedUsers);
    } catch (err) {
        console.error("Error fetching users:", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEnrollClick = (user: Profile) => {
      setSelectedUser(user);
      setShowEnrollModal(true);
  };

  const handleApprove = async (userId: string) => {
      if (!confirm("Approve this user?")) return;
      const { error } = await supabase.from('profiles').update({ status: 'approved' }).eq('id', userId);
      if (!error) fetchUsers();
  };

  const handleReject = async (userId: string) => {
      if (!confirm("Reject this user?")) return;
      const { error } = await supabase.from('profiles').update({ status: 'rejected' }).eq('id', userId);
      if (!error) fetchUsers();
  };

  // Filter users based on tab
  const filteredUsers = users.filter(u => {
      if (activeTab === 'active') return u.status === 'approved' || !u.status; // Default to approved if null
      if (activeTab === 'pending') return u.status === 'pending';
      return false;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Directory</h1>
          <p className="text-slate-500 text-sm">Manage enrolled students and faculty.</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-white/30 justify-between items-center">
          <div className="flex p-1 bg-slate-100 rounded-lg">
             <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Active Users
             </button>
             <button 
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Pending Approval
                {users.filter(u => u.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                        {users.filter(u => u.status === 'pending').length}
                    </span>
                )}
             </button>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-primary-100 outline-none" 
              placeholder="Search users..." 
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Biometrics</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading directory...</td></tr>
              ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No {activeTab} users found.</td></tr>
              ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{user.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'teacher' ? 'info' : 'neutral'} className="capitalize">{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4">
                         {user.status === 'pending' ? (
                             <Badge variant="warning">Pending</Badge>
                         ) : (
                             <Badge variant="success">Active</Badge>
                         )}
                      </td>
                      <td className="px-6 py-4">
                        {user.has_face_data ? (
                            <Badge variant="success" className="gap-1"><ScanFace className="w-3 h-3" /> Enrolled</Badge>
                        ) : (
                            <Badge variant="warning">Not Enrolled</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {activeTab === 'pending' ? (
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleApprove(user.id)}>
                                    <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(user.id)}>
                                    <X className="w-4 h-4 mr-1" /> Reject
                                </Button>
                            </div>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => handleEnrollClick(user)}>
                                {user.has_face_data ? 'Update Face' : 'Enroll Face'}
                            </Button>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Enroll Modal */}
      {showEnrollModal && selectedUser && (
          <EnrollModal 
            user={selectedUser} 
            onClose={() => { setShowEnrollModal(false); setSelectedUser(null); }} 
            onSuccess={() => { fetchUsers(); setShowEnrollModal(false); }}
          />
      )}
    </div>
  );
};

const EnrollModal = ({ user, onClose, onSuccess }: { user: Profile, onClose: () => void, onSuccess: () => void }) => {
    const [image, setImage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imgData = reader.result as string;
                setImage(imgData);
                setProcessing(true);
                setError(null);
                
                try {
                    const desc = await FaceAuthService.getInstance().generateFaceDescriptor(imgData);
                    if (desc) {
                        setDescriptor(desc);
                    } else {
                        setError("No face detected. Please try a clearer photo.");
                    }
                } catch (err: any) {
                    setError("Processing error: " + err.message);
                } finally {
                    setProcessing(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!descriptor) return;
        setProcessing(true);
        try {
            await FaceAuthService.getInstance().enrollStudentFace(user.id, descriptor);
            onSuccess();
        } catch (err: any) {
            setError("Save failed: " + err.message);
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <GlassCard className="w-full max-w-lg bg-white relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-2">Biometric Enrollment</h2>
                <p className="text-sm text-slate-500 mb-6">Enrolling face data for <span className="font-bold text-slate-800">{user.name}</span></p>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative bg-slate-50">
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            
                            {image ? (
                                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary-100 shadow-lg">
                                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                    {processing && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-400 py-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium">Click to upload face photo</p>
                                    <p className="text-xs">Supports JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                        
                        {error && (
                            <div className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded text-center">
                                {error}
                            </div>
                        )}

                        {descriptor && !processing && !error && (
                            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 p-2 rounded-lg justify-center animate-in fade-in">
                                <Check className="w-4 h-4" /> Face Vector Generated Successfully
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button disabled={!descriptor || processing} onClick={handleSave}>
                            {processing ? 'Saving...' : 'Save Biometrics'}
                        </Button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
