import React, { useState, useEffect, useRef } from 'react';
import { UserProfile as UserProfileType, CurrencyType, CURRENCIES } from '../types';
import { getTranslation, LANGUAGES, LanguageType } from '../utils/translations';
import { getTheme, THEME_COLORS, ThemeColor, getCardStyle } from '../utils/theme';
import { 
  User, Mail, DollarSign, Sparkles, CreditCard, Check, Settings, 
  Moon, Sun, Languages, Palette, Lock, RefreshCw, Camera, 
  Video, Eye, X, AlertCircle 
} from 'lucide-react';

interface UserProfileProps {
  profile: UserProfileType;
  onUpdateProfile: (updates: Partial<UserProfileType>) => void;
  onClearData: () => void;
}

export default function UserProfile({ profile, onUpdateProfile, onClearData }: UserProfileProps) {
  // Setup reactive form states
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [currency, setCurrency] = useState<CurrencyType>(profile.currency);
  const [language, setLanguage] = useState<LanguageType>(profile.language || 'en');
  const [monthlyIncomeSetting, setMonthlyIncomeSetting] = useState(profile.monthlyIncomeSetting);
  const [avatar, setAvatar] = useState(profile.avatarUrl || '');
  const [selectedThemeColor, setSelectedThemeColor] = useState<ThemeColor>((profile.themeColor as ThemeColor) || 'indigo');
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'personal' | 'financial' | 'appearance'>('all');

  // Live Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Keep local form values synced with any parent refresh
  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setCurrency(profile.currency);
    setLanguage(profile.language || 'en');
    setMonthlyIncomeSetting(profile.monthlyIncomeSetting);
    setAvatar(profile.avatarUrl || '');
    setSelectedThemeColor((profile.themeColor as ThemeColor) || 'indigo');
  }, [profile]);

  const activeTheme = getTheme(profile);
  const styles = getCardStyle(profile.theme);
  const t = (key: string) => getTranslation(key, profile.language || 'en');

  // Ensure camera stream ends when component is unmounted or closed
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Start webcam feed helper
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      // Prompt user for webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.log('Webcam play error', err));
      }
    } catch (err: any) {
      console.error('Webcam stream failed', err);
      setCameraError('Webcam access was denied or is not supported inside this preview environment. Please ensure permissions are allowed.');
    }
  };

  // Close webcam stream helper
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    setCameraError(null);
  };

  // Snapshot the current canvas raw stream to base64 encoding PNG files!
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Center-crop and capture image perfectly for elegant circular avatar
        ctx.drawImage(videoRef.current, 0, 0, 256, 256);
        const base64Data = canvas.toDataURL('image/png');
        setAvatar(base64Data);
        // Instant updates so avatar propagates immediately!
        triggerProfileUpdate({ avatarUrl: base64Data }, 'Live Camera Capture');
      }
      stopCamera();
    }
  };

  // Trigger update for specific settings sections safely (instant visual confirmation)
  const triggerProfileUpdate = (updatedFields: Partial<UserProfileType>, sectionLabel: string) => {
    onUpdateProfile(updatedFields);
    setSuccessMsg(`${t('successSaved')} (${sectionLabel} Saved Successfully)`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleGlobalUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    triggerProfileUpdate({
      name,
      email,
      currency,
      language,
      monthlyIncomeSetting: Number(monthlyIncomeSetting),
      avatarUrl: avatar || undefined,
      themeColor: selectedThemeColor
    }, 'All Settings & Preferences');
  };

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=256'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn" id="profile-container">
      
      {/* Dynamic Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between pb-5 border-b ${styles.divider}`}>
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Settings className={`w-6.5 h-6.5 ${activeTheme.primaryText}`} />
            <span className={styles.textTitle}>{t('accountPreferences')}</span>
          </h2>
          <p className="text-gray-400 text-xs mt-1.5">{t('configureFintech')}</p>
        </div>
        
        {/* Sections filtering navigation */}
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {['all', 'personal', 'financial', 'appearance'].map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all select-none ${
                activeSection === sec
                  ? `${activeTheme.primaryBg} text-white shadow-xs`
                  : `${styles.bg} ${styles.border} text-gray-500 hover:text-gray-950`
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {showSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center gap-3 animate-fadeIn shadow-xs">
          <Check className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Identity Showcase Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Showcase Panel */}
          <div className={`${styles.bg} p-6 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
            <div className={`absolute top-0 inset-x-0 h-24 ${activeTheme.primaryBg} opacity-10 pointer-events-none`} />
            
            <div className="relative group mt-4">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                alt={profile.name}
                className={`w-28 h-28 rounded-full object-cover border-4 ${activeTheme.borderPrimary} shadow-md transform group-hover:scale-105 transition-transform duration-300`}
                referrerPolicy="no-referrer"
              />
              <div className={`absolute -bottom-1 -right-1 ${activeTheme.primaryBg} text-white p-2 rounded-full shadow-lg`}>
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            
            <h3 className={`text-lg mt-5 tracking-tight ${styles.textTitle}`}>{profile.name || 'Financial Enthusiast'}</h3>
            <p className="text-xs text-gray-400 font-medium">{profile.email || 'guest@tracker.financial'}</p>
            
            <div className={`mt-6 w-full pt-6 border-t ${styles.divider} flex justify-around text-center`}>
              <div>
                <span className="block text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">{t('baseIncome')}</span>
                <span className={`font-mono font-black text-sm mt-1 block ${styles.textTitle}`}>
                  {CURRENCIES[profile.currency]?.symbol || '₹'}
                  {profile.monthlyIncomeSetting.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">{t('currencySymbolText')}</span>
                <span className={`px-2.5 py-1 ${activeTheme.lightBg} ${activeTheme.lightText} rounded-lg text-xs font-black uppercase mt-1 inline-block`}>
                  {profile.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Active Aesthetics */}
          <div className={`${styles.bg} p-6 space-y-4`}>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Palette className={`w-4 h-4 ${activeTheme.primaryText}`} />
              Active System Colors
            </h4>
            
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 ${styles.subcard} text-xs font-medium`}>
                <span className="text-gray-400">Color Family</span>
                <span className={`font-bold uppercase ${styles.textTitle} flex items-center gap-1.5`}>
                  <span className={`w-3 h-3 rounded-full ${activeTheme.primaryBg}`} />
                  {THEME_COLORS[selectedThemeColor]?.name || selectedThemeColor}
                </span>
              </div>

              <div className={`flex items-center justify-between p-3 ${styles.subcard} text-xs font-medium`}>
                <span className="text-gray-400">Appearance Mode</span>
                <span className={`font-bold uppercase ${styles.textTitle}`}>
                  {profile.theme === 'dark' ? 'Dark Modern' : 'Light Cream'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => triggerProfileUpdate({ theme: profile.theme === 'light' ? 'dark' : 'light' }, 'Theme Mode')}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 border ${styles.border} ${profile.theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors shadow-xs`}
            >
              {profile.theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-slate-800" />
                  <span>{t('switchDark')}</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{t('switchLight')}</span>
                </>
              )}
            </button>
          </div>
          
          {/* Data Controls Purge */}
          <div className="bg-red-500/10 p-5 rounded-3xl border border-red-500/25 space-y-3">
            <h4 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" />
              Wipe and Purge Engine
            </h4>
            <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
              Running locally inside your secure web container. If you wish to flush all saved logs, goals, and customized accounts, wipe database here.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('Urgent: This will purge ALL saved expenses, income statements, alerts, and settings from your local browser database. Carry on?')) {
                  onClearData();
                }
              }}
              className="w-full py-2.5 px-3 text-[10px] font-extrabold uppercase tracking-wider text-red-500 hover:text-white bg-red-500/10 hover:bg-red-650 rounded-xl border border-red-500/25 transition-all text-center block"
            >
              {t('resetApp')}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Preference Forms */}
        <div className="lg:col-span-8">
          <form onSubmit={handleGlobalUpdate} className="space-y-6">
            
            {/* 1. COLOR THEME OPTIONS */}
            {(activeSection === 'all' || activeSection === 'appearance') && (
              <div className={`${styles.bg} p-6 sm:p-8 space-y-6`}>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Palette className={`w-4 h-4 ${activeTheme.primaryText}`} />
                      <span className={styles.textTitle}>Change Interface Color Palette Option</span>
                    </h3>
                  </div>
                  <p className="text-gray-400 text-xs mt-1.5 font-medium">Configure your custom brand accents. Click an option sphere to update the color theme fully across all pages immediately.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                  {(Object.keys(THEME_COLORS) as Array<ThemeColor>).map((colorKey) => {
                    const optionTheme = THEME_COLORS[colorKey];
                    const isSelected = selectedThemeColor === colorKey;
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => {
                          setSelectedThemeColor(colorKey);
                          triggerProfileUpdate({ themeColor: colorKey }, 'Color Scheme');
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 justify-start ${
                          isSelected
                            ? `${optionTheme.primaryBorder} bg-slate-50/10 ring-4 ${optionTheme.pulseRing}`
                            : `${styles.border} ${profile.theme === 'dark' ? 'bg-slate-950/30 hover:bg-slate-800' : 'bg-white hover:bg-slate-50'}`
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full ${optionTheme.primaryBg} shrink-0 shadow-xs flex items-center justify-center`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <div className="text-left">
                          <span className={`block text-xs font-bold leading-tight ${styles.textTitle}`}>
                            {optionTheme.name}
                          </span>
                          <span className="block text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
                            {colorKey} style
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Demonstration Alert Box */}
                <div className={`p-4 rounded-2xl border ${activeTheme.borderPrimary} ${activeTheme.lightBg} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${activeTheme.primaryBg} text-white`}><Sparkles className="w-4 h-4" /></span>
                    <div>
                      <span className={`block text-xs font-extrabold ${activeTheme.lightText}`}>Dynamic Palette Demo Mode</span>
                      <span className="block text-[10px] text-gray-500 mt-0.5 font-semibold">Your interface utilizes this energetic accent style beautifully.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerProfileUpdate({ themeColor: selectedThemeColor }, 'Live Theme')}
                    className={`px-4 py-2 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-xs`}
                  >
                    Apply Accent Color Fully
                  </button>
                </div>
              </div>
            )}

            {/* 2. PERSONAL INFORMATION & LIVE CAMERA AVATAR PICKER */}
            {(activeSection === 'all' || activeSection === 'personal') && (
              <div className={`${styles.bg} p-6 sm:p-8 space-y-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <User className={`w-4 h-4 ${activeTheme.primaryText}`} />
                      <span className={styles.textTitle}>Change Personal Identification Credentials</span>
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 font-medium">Manage credentials and configure live photograph displays.</p>
                  </div>
                  
                  {/* Save button specific for this column */}
                  <button
                    type="button"
                    onClick={() => triggerProfileUpdate({ name, email }, 'Personal Credentials')}
                    className={`px-3 py-1.5 rounded-xl border ${activeTheme.borderPrimary} ${activeTheme.primaryText} hover:bg-gray-50/55 text-hover-black text-[10px] font-extrabold uppercase tracking-wider transition-all`}
                  >
                    Update Credentials
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-450 uppercase tracking-widest mb-2.5">
                      {t('full_name')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 ${styles.input}`}
                        placeholder="Jane Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-450 uppercase tracking-widest mb-2.5">
                      {t('email_address')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 ${styles.input}`}
                        placeholder="jane.doe@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* AVATAR SELECTOR & THE ULTIMATE LIVE WEBCAM CAMERA BLOCK */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="block text-xs font-extrabold text-gray-450 uppercase tracking-widest">
                      {t('chooseAvatar')}
                    </label>
                    
                    {/* Live Snapshot Camera trigger */}
                    <button
                      type="button"
                      onClick={cameraActive ? stopCamera : startCamera}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                        cameraActive 
                          ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30 scale-105' 
                          : `${activeTheme.lightBg} ${activeTheme.lightText} border ${activeTheme.borderPrimary} hover:scale-105`
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{cameraActive ? 'Close Camera Feed' : 'Capture Live Photo via Webcam'}</span>
                    </button>
                  </div>

                  {/* Camera Widget Display Area when active as a full custom container */}
                  {cameraActive && (
                    <div className={`p-4 rounded-3xl ${styles.subcard} border-2 ${activeTheme.primaryBorder} animate-fadeIn flex flex-col items-center justify-center space-y-4 max-w-md mx-auto`}>
                      <div className="text-center">
                        <span className="block text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center justify-center gap-1">
                          <Video className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                          Live Webcam Capture Panel
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">Position your face in the camera frame, then capture your circular avatar.</p>
                      </div>

                      {cameraError ? (
                        <div className="flex flex-col items-center text-center p-4 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-2xl space-y-2">
                          <AlertCircle className="w-6 h-6 text-rose-500" />
                          <p className="text-[10px] leading-relaxed font-semibold">{cameraError}</p>
                          <button
                            type="button"
                            onClick={startCamera}
                            className={`px-3 py-1 bg-rose-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider`}
                          >
                            Retry Access
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-950 flex items-center justify-center shadow-inner">
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover transform -scale-x-100"
                            playsInline
                            muted
                          />
                          {/* Circle Focus viewfinder frame */}
                          <div className="absolute inset-0 border-2 border-dashed border-white/40 pointer-events-none rounded-full m-2 animate-spin-slow" />
                        </div>
                      )}

                      <div className="flex items-center gap-3 w-full">
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="flex-1 py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-slate-850 hover:bg-slate-800 text-gray-400 border border-slate-700/80"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!!cameraError}
                          onClick={capturePhoto}
                          className={`flex-1 py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider text-white rounded-xl ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Take Snapshot
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3.5 items-center">
                    {avatars.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(av);
                          triggerProfileUpdate({ avatarUrl: av }, 'Avatar photo');
                        }}
                        className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all ${
                          avatar === av ? `border-gray-900 scale-110 shadow-sm ring-2 ${activeTheme.ringColor}` : 'border-transparent hover:scale-105'
                        }`}
                      >
                        <img src={av} alt="avatar option" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {avatar === av && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                          </div>
                        )}
                      </button>
                    ))}
                    
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      onBlur={() => triggerProfileUpdate({ avatarUrl: avatar }, 'Custom Avatar Link')}
                      className={`flex-1 min-w-[200px] px-4 py-2.5 ${styles.input} text-[11px] font-mono`}
                      placeholder={t('manualUrl')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. FINANCIAL OBJECTIVES & LOCALIZATION */}
            {(activeSection === 'all' || activeSection === 'financial') && (
              <div className={`${styles.bg} p-6 sm:p-8 space-y-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <DollarSign className={`w-4 h-4 ${activeTheme.primaryText}`} />
                      <span className={styles.textTitle}>Change Financial Scale & Location Region</span>
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 font-medium">Adjust limit ratios, localized currency symbols and translation models.</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => triggerProfileUpdate({ currency, monthlyIncomeSetting, language }, 'Financial Configuration')}
                    className={`px-3 py-1.5 rounded-xl border ${activeTheme.borderPrimary} ${activeTheme.primaryText} hover:bg-gray-50/55 text-hover-black text-[10px] font-extrabold uppercase tracking-wider transition-all`}
                  >
                    Update Finance Scales
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-450 uppercase tracking-widest mb-2.5">
                      {t('defaultCurrency')}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <select
                        value={currency}
                        onChange={(e) => {
                          const newCurr = e.target.value as CurrencyType;
                          setCurrency(newCurr);
                          triggerProfileUpdate({ currency: newCurr }, 'System Currency');
                        }}
                        className={`w-full pl-11 pr-8 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-hidden focus:ring-4 focus:ring-opacity-10 transition-all font-semibold appearance-none cursor-pointer ${
                          profile.theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : ''
                        }`}
                      >
                        {Object.values(CURRENCIES).map((c) => (
                          <option key={c.code} value={c.code} className={profile.theme === 'dark' ? 'bg-slate-900 text-white' : ''}>
                            {c.country}: {c.name} ({c.symbol})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 font-extrabold text-[10px]">▼</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-450 uppercase tracking-widest mb-2.5">
                      {t('monthlyIncomeLimit')}
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="number"
                        required
                        min="0"
                        value={monthlyIncomeSetting}
                        onChange={(e) => setMonthlyIncomeSetting(Number(e.target.value))}
                        className={`w-full pl-11 pr-4 py-3 ${styles.input} font-semibold font-mono`}
                        placeholder="125000"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-extrabold text-gray-450 uppercase tracking-widest mb-2.5">
                      {t('selectLanguage')}
                    </label>
                    <div className="relative">
                      <Languages className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <select
                        value={language}
                        onChange={(e) => {
                          const val = e.target.value as LanguageType;
                          setLanguage(val);
                          triggerProfileUpdate({ language: val }, 'App Language');
                        }}
                        className={`w-full pl-11 pr-8 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-xs text-gray-800 focus:outline-hidden transition-all font-semibold appearance-none cursor-pointer ${
                          profile.theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : ''
                        }`}
                      >
                        {Object.values(LANGUAGES).map((lang) => (
                          <option key={lang.code} value={lang.code} className={profile.theme === 'dark' ? 'bg-slate-900 text-white' : ''}>
                            {lang.nativeName} ({lang.name})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 font-extrabold text-[10px]">▼</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MASTER BOTTOM SAVE CONTROL */}
            <div className={`flex items-center justify-between p-4 ${styles.bg} border ${styles.border} flex-wrap gap-4`}>
              <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">
                Securely encrypted & persistent locally in-browser
              </span>
              
              <button
                type="submit"
                className={`px-6 py-3 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} ${activeTheme.primaryActiveBg} text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:shadow-md transition-all flex items-center gap-2`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update Preferences Options</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
