import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Mail, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Login = () => {
  const { login, user, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  const fillAdmin = () => {
      setEmail('admin');
      setPassword('admin123');
      setIsSignUp(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!email || !password) {
        setLocalError("Please fill in all fields");
        return;
    }

    if (isSignUp) {
        if (!fullName) {
            setLocalError("Full Name is required for sign up");
            return;
        }
        setLocalLoading(true);
        try {
            // 1. VERIFY AGAINST INSTITUTE REGISTRY
            const { data: registryRecord, error: registryError } = await supabase
                .from('institute_registry')
                .select('*')
                .eq('email', email)
                .single();

            if (!registryRecord) {
                throw new Error("Email not found in Institute Records. Try: student@demo.edu");
            }

            if (registryRecord.role !== role) {
                 throw new Error(`Role mismatch. This email is registered as a ${registryRecord.role}.`);
            }

            // 2. Sign Up with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                // 3. Create Profile with 'pending' status
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: email,
                        name: fullName,
                        role: role,
                        status: 'pending' // EXPLICITLY PENDING
                    });
                
                if (profileError) {
                    // If profile fails (e.g. duplicate), we might want to warn
                    console.error("Profile creation failed:", profileError);
                }

                setSuccessMsg("Registration successful! Please check your email for verification. Your account will then be reviewed by Admin.");
                setIsSignUp(false);
                setEmail('');
                setPassword('');
                setFullName('');
            }
        } catch (err: any) {
            setLocalError(err.message);
        } finally {
            setLocalLoading(false);
        }
    } else {
        // Login
        await login(email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f0f4f8]">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-300/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-300/30 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-purple-600 text-white shadow-xl shadow-primary-500/30 mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Attendify</h1>
          <p className="text-slate-500 mt-2">Secure Academic Portal</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="p-8 shadow-2xl border-white/60 backdrop-blur-xl">
            {successMsg ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Request Sent</h3>
                    <p className="text-sm text-slate-600 mb-6">{successMsg}</p>
                    <Button onClick={() => setSuccessMsg(null)} className="w-full">Back to Login</Button>
                </div>
            ) : (
                <>
                    <div className="flex justify-center mb-6 bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isSignUp ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isSignUp ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                    {isSignUp && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                            <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                placeholder="John Doe"
                            />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type={isSignUp ? "email" : "text"} 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            placeholder={isSignUp ? "student@university.edu" : "Email or Username"}
                        />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                        <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/50 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                            placeholder="••••••••"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        </div>
                    </div>

                    {isSignUp && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('student')}
                                    className={`py-2 rounded-xl text-sm font-medium border transition-all ${role === 'student' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white/50 border-slate-200 text-slate-600'}`}
                                >
                                    Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('teacher')}
                                    className={`py-2 rounded-xl text-sm font-medium border transition-all ${role === 'teacher' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white/50 border-slate-200 text-slate-600'}`}
                                >
                                    Teacher
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 text-center pt-1">
                                * Email must exist in Institute Registry
                            </p>
                        </div>
                    )}

                    {(authError || localError) && (
                        <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-lg flex items-center gap-2"
                        >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        {authError || localError}
                        </motion.div>
                    )}

                    <Button 
                        type="submit" 
                        className="w-full py-3.5 text-base shadow-xl shadow-primary-500/20" 
                        disabled={isLoading || localLoading}
                    >
                        {(isLoading || localLoading) ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isSignUp ? 'Verify & Register' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-2" /></>}
                    </Button>
                    </form>
                </>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Forgot credentials? Contact IT Support.<br/>
                <span className="opacity-50">v2.4.0-stable</span>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Demo Credentials Hint */}
        <div className="mt-8 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Demo Access</p>
            <button 
                onClick={fillAdmin}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-full text-xs font-bold text-slate-700 transition-colors"
            >
                <Zap className="w-3 h-3 fill-slate-700" /> Auto-Fill Admin
            </button>
        </div>
      </div>
    </div>
  );
};
