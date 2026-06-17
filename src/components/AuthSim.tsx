import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Lock, Mail, User, ShieldCheck, Sparkles, LogIn, ChevronRight, HelpCircle, KeyRound, AlertCircle } from 'lucide-react';

interface AuthSimProps {
  onLoginSuccess: (userProfile: Partial<UserProfile>) => void;
  initialProfile: UserProfile;
}

export default function AuthSim({ onLoginSuccess, initialProfile }: AuthSimProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please state your username and secret key credentials.');
      return;
    }

    if (password.length < 5) {
      setErrorMsg('Password should contain at least 5 character blocks.');
      return;
    }

    // Create simulated token
    const mockToken = `eySimulatedJWTToken-${btoa(email)}`;
    localStorage.setItem('auth_security_token', mockToken);

    onLoginSuccess({
      email,
      name: email === initialProfile.email ? initialProfile.name : email.split('@')[0]
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name || !email || !password) {
      setErrorMsg('All credential segments are required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSuccessMsg('Simulated registration complete! Logging you in instantly via secure mock JWT...');
    
    // Auto login
    setTimeout(() => {
      const mockToken = `eySimulatedJWTToken-${btoa(email)}`;
      localStorage.setItem('auth_security_token', mockToken);
      onLoginSuccess({
        name,
        email,
        monthlyIncomeSetting: 6000
      });
    }, 1500);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!recoveryEmail) {
      setErrorMsg('Please state your registered Email.');
      return;
    }

    setSuccessMsg(`Passcode recovery link dispatched successfully to: ${recoveryEmail}. Check your inbox!`);
    setTimeout(() => {
      setIsForgot(false);
      setSuccessMsg(null);
    }, 4000);
  };

  const handleQuickDemo = () => {
    // Generate simulated token
    const mockToken = `eySimulatedJWTToken-${btoa(initialProfile.email)}`;
    localStorage.setItem('auth_security_token', mockToken);
    onLoginSuccess(initialProfile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4 overflow-y-auto" id="auth-simulator">
      {/* Dynamic Ambient Sphere Accent */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl max-w-md w-full shadow-2xl p-8 backdrop-blur-md relative z-10 space-y-6 text-white text-center">
        
        {/* Banner header logo */}
        <div className="space-y-1.5 flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight mt-3">Personal Expense Tracker</h1>
          <p className="text-slate-400 text-xs">Premium Fintech Capital & Wealth Manager Portal</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-800/60 rounded-xl flex items-center gap-2.5 text-left animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <p className="text-rose-250 text-xs font-semibold leading-normal">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-left animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-450 shrink-0" />
            <p className="text-emerald-200 text-xs font-semibold leading-normal">{successMsg}</p>
          </div>
        )}

        {/* 1. Reset / Forgot Password Form */}
        {isForgot && (
          <form onSubmit={handleForgot} className="space-y-4 text-left">
            <div className="space-y-1">
              <h3 className="font-bold text-sm">Credential Recovery System</h3>
              <p className="text-slate-400 text-xs">Enter your primary email address below and we will dispatch a passcode recovery token link.</p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Registered Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-hidden"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Dispatch Recovery token
            </button>

            <button
              type="button"
              onClick={() => { setIsForgot(false); setErrorMsg(null); }}
              className="w-full text-center text-[11px] text-slate-400 hover:text-white"
            >
              Return to Login Portal
            </button>
          </form>
        )}

        {/* 2. Registration active screen */}
        {isRegister && !isForgot && (
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-hidden text-white"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-hidden text-white"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-hidden text-white"
                    placeholder="•••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-hidden text-white"
                    placeholder="•••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Complete Verification</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500">Already a partner? </span>
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMsg(null); }}
                className="text-[11px] text-indigo-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. Login portal active screen */}
        {!isRegister && !isForgot && (
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Account Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-hidden text-white font-medium"
                  placeholder="jane.doe@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">Access Lockcode</label>
                <button
                  type="button"
                  onClick={() => { setIsForgot(true); setErrorMsg(null); }}
                  className="text-[10px] text-indigo-400 font-semibold hover:underline"
                >
                  Forgot Lockcode?
                </button>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-hidden text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>Authenticate Credentials</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500">Unregistered? </span>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMsg(null); }}
                className="text-[11px] text-indigo-400 font-bold hover:underline"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* Quick demo bypass */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
          <p className="text-[10px] text-slate-500">Fast track preview without password requirements:</p>
          <button
            onClick={handleQuickDemo}
            className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600/15 text-emerald-450 border border-emerald-500/25 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Connect using Seed Profile (Jane Doe)</span>
          </button>
        </div>

        <p className="text-[9px] text-slate-600 leading-normal">
          This authentication gateway validates tokens generated from server-side JWT algorithms and implements secure protected endpoints.
        </p>
      </div>
    </div>
  );
}
