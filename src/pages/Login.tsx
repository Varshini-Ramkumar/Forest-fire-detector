import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Radio,
  Sun,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  TreePine,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (role: 'admin' | 'official') => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const {
    loginWithEmail,
    loginWithGoogle,
    loginAsDemo,
    authError,
    clearError,
    isLoading,
    isDemoMode,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    const result = await loginWithEmail(email, password);
    setIsSubmitting(false);
    if (result.success && result.role) {
      onLoginSuccess(result.role);
    }
  };

  const handleGoogleSubmit = async () => {
    setIsSubmitting(true);
    const result = await loginWithGoogle();
    setIsSubmitting(false);
    if (result.success && result.role) {
      onLoginSuccess(result.role);
    }
  };

  const handleDemoAdminClick = async () => {
    setEmail('admin@igniswatch.demo');
    setPassword('Admin@123');
    setIsSubmitting(true);
    await loginAsDemo('admin');
    setIsSubmitting(false);
    onLoginSuccess('admin');
  };

  const handleDemoOfficialClick = async () => {
    setEmail('official@igniswatch.demo');
    setPassword('Official@123');
    setIsSubmitting(true);
    await loginAsDemo('official');
    setIsSubmitting(false);
    onLoginSuccess('official');
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Background Stylized Forest Fire & Topo Imagery */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(#059669 0.75px, transparent 0.75px), radial-gradient(#064e3b 0.75px, #030712 0.75px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px',
            opacity: 0.25,
          }}
        />
      </div>

      {/* Top Bar with IGNIS WATCH Logo at top-left corner per Requirement #3 */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-slate-900/80 backdrop-blur-md">
        <Logo size="md" light />
        <div className="flex items-center gap-2">
          {isDemoMode && (
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Demo Mode Active
            </span>
          )}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 border border-slate-800 bg-slate-900/60 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LoRa Gateway Status: <strong>Online</strong></span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          {/* Main Login Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl p-6 sm:p-8">
            {/* Header copy */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                <TreePine className="w-3.5 h-3.5" />
                <span>Forest Department Command Access</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                IGNIS <span className="text-amber-500">WATCH</span>
              </h2>
              <p className="text-xs font-medium text-emerald-400 mt-1">
                Solar-Powered LoRa-Based Forest Fire Detection System
              </p>
              <p className="text-[11px] text-slate-400 italic mt-0.5">
                "Early Detection. Faster Response. Safer Forests."
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">
                  {authError}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="official@igniswatch.demo"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Continue with Google */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-400 font-semibold">
                  Or
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleSubmit}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-3 border border-slate-700 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Create account button */}
            <div className="text-center mt-4 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Don't have a login? <strong className="text-white underline">Request Officer Account</strong>
              </button>
            </div>

            {/* DEMO ACCESS SECTION - VERY IMPORTANT PER REQUIREMENT #4 */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  DEMO ACCESS (ONE-CLICK)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Evaluation Mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Admin Demo Button */}
                <button
                  type="button"
                  onClick={handleDemoAdminClick}
                  className="flex flex-col p-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800/80 transition-all text-left shadow group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-amber-300">
                      Login as Admin Demo
                    </span>
                    <Shield className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    admin@igniswatch.demo
                  </span>
                  <span className="text-[9px] text-emerald-400 mt-0.5 font-semibold">
                    Role: Administrator (Full System)
                  </span>
                </button>

                {/* Forest Official Demo Button */}
                <button
                  type="button"
                  onClick={handleDemoOfficialClick}
                  className="flex flex-col p-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-800/80 transition-all text-left shadow group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-emerald-300">
                      Login as Official Demo
                    </span>
                    <TreePine className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    official@igniswatch.demo
                  </span>
                  <span className="text-[9px] text-emerald-400 mt-0.5 font-semibold">
                    Role: Forest Official (Operational)
                  </span>
                </button>
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Passcode: <strong className="text-slate-200 font-mono">Admin@123</strong> / <strong className="text-slate-200 font-mono">Official@123</strong></span>
                <span className="text-emerald-400 font-semibold text-[10px]">Pre-seeded</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-900/80">
        <p>
          IGNIS WATCH • Solar-Powered LoRa-Based Forest Fire Detection and Monitoring System
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Designed for Government Forest Reserves & College Engineering Project Demonstration
        </p>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-slate-200">
            <h3 className="text-base font-bold text-white mb-2">Password Recovery</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              For security compliance in government forestry networks, password resets are handled via your Divisional IT Administrator or using the demo credentials provided below.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 mb-4">
              Default Demo Password: <strong>Official@123</strong>
            </div>
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* Register/Create Account Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-slate-200">
            <h3 className="text-base font-bold text-white mb-2">Officer Account Registration</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              New forest officials are provisioned by the State Forest Command Administrator. You can immediately access the portal with full credentials using the <strong>Demo Access</strong> buttons!
            </p>
            <button
              onClick={() => {
                setIsRegisterModalOpen(false);
                handleDemoOfficialClick();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs mb-2"
            >
              Launch as Forest Official
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
