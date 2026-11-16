import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthExperienceProps {
  onSuccess?: () => void;
  onOpenRules?: () => void;
  compact?: boolean;
}

type AuthMode = 'signin' | 'signup' | 'reset' | 'otp';

function mapFirebaseAuthError(err: any): { message: string; tip?: string } {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return {
        message: 'Incorrect email or password. Please verify your credentials and try again.',
      };
    case 'auth/user-not-found':
      return {
        message: 'No account was found with this email.',
        tip: 'Switch to the "Register" tab to create your free member account.',
      };
    case 'auth/email-already-in-use':
      return {
        message: 'An account with this email already exists.',
        tip: 'Switch to the "Sign In" tab or use "Forgot Password".',
      };
    case 'auth/weak-password':
      return {
        message: 'Password is too weak. Please use at least 6 characters.',
      };
    case 'auth/invalid-email':
      return {
        message: 'Please enter a valid email address format (e.g. name@domain.com).',
      };
    case 'auth/too-many-requests':
      return {
        message: 'Access temporarily blocked due to multiple failed attempts.',
        tip: 'Please wait a couple of minutes before trying again or reset your password.',
      };
    case 'auth/operation-not-allowed':
      return {
        message: 'Sign-in provider is disabled in your Firebase project.',
        tip: 'Enable Google or Email/Password in Firebase Console → Authentication → Sign-in method.',
      };
    case 'auth/unauthorized-domain':
      return {
        message: 'This web domain is not yet authorized in Firebase Auth.',
        tip: 'Add this domain to Firebase Console → Authentication → Settings → Authorized domains.',
      };
    case 'auth/popup-blocked':
      return {
        message: 'Google Sign-In popup was blocked by your browser.',
        tip: 'Please enable popups for this site in your browser settings.',
      };
    case 'auth/popup-closed-by-user':
      return {
        message: 'Google Sign-In window was closed before completion.',
      };
    case 'auth/account-exists-with-different-credential':
      return {
        message: 'An account already exists with the same email using a different sign-in method.',
        tip: 'Try signing in with Google or Email/Password depending on which one was first registered.',
      };
    case 'auth/network-request-failed':
      return {
        message: 'Network request failed. Please check your internet connection.',
      };
    default:
      return {
        message: err?.message || 'Authentication request failed. Please try again.',
      };
  }
}

export const AuthExperience: React.FC<AuthExperienceProps> = ({
  onSuccess,
  onOpenRules,
  compact = false,
}) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
  } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ message: string; tip?: string } | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // OTP Verification State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [expectedOtp, setExpectedOtp] = useState<string>('');
  const [otpPendingEmail, setOtpPendingEmail] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'otp' && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [mode, otpCountdown]);

  const generateAndDispatchOtp = (targetEmail: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(code);
    setOtpPendingEmail(targetEmail);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpCountdown(30);
    setMode('otp');
    setErrorDetails(null);
    setInfoMsg(`A 6-digit OTP code has been generated for ${targetEmail}.`);
    showToast(`OTP Code generated: ${code}`, 'info');

    // Auto focus first OTP input box on next tick
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 150);
  };

  const handleGoogle = async () => {
    setErrorDetails(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      showToast('Signed in successfully with Google!', 'success');
      onSuccess?.();
    } catch (err: any) {
      const errInfo = mapFirebaseAuthError(err);
      setErrorDetails(errInfo);
      showToast(errInfo.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setInfoMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorDetails({ message: 'Email address is required.' });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'reset') {
        await sendPasswordReset(cleanEmail);
        setInfoMsg(`Password reset link sent to ${cleanEmail}. Check your inbox & spam folder.`);
        showToast('Password reset link dispatched.', 'success');
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setErrorDetails({ message: 'Password must be at least 6 characters long.' });
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(cleanEmail, password, displayName);
        generateAndDispatchOtp(cleanEmail);
      } else if (mode === 'signin') {
        await signInWithEmail(cleanEmail, password);
        generateAndDispatchOtp(cleanEmail);
      }
    } catch (err: any) {
      const errInfo = mapFirebaseAuthError(err);
      setErrorDetails(errInfo);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    // Only accept numeric digit
    const cleaned = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
      // Pasted multiple characters
      const pastedDigits = cleaned.slice(0, 6).split('');
      pastedDigits.forEach((char, i) => {
        if (index + i < 6) newDigits[index + i] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(index + pastedDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Auto-advance to next input if filled
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    const entered = otpDigits.join('');

    if (entered.length < 6) {
      setErrorDetails({ message: 'Please enter all 6 digits of the OTP code.' });
      return;
    }

    if (entered === expectedOtp) {
      showToast('OTP verified! Welcome to OBSIDIUSS HUB.', 'success');
      onSuccess?.();
    } else {
      setErrorDetails({
        message: 'Invalid verification code. Please check the 6 digits and try again.',
        tip: 'Click "Resend Code" if you need a new OTP.',
      });
      showToast('Incorrect OTP code.', 'error');
    }
  };

  const handleResendOtp = () => {
    if (otpCountdown > 0) return;
    generateAndDispatchOtp(otpPendingEmail || email);
  };

  // OTP Verification Screen
  if (mode === 'otp') {
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-black text-slate-950">
            Email OTP Verification
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We generated a 6-digit security OTP code for{' '}
            <strong className="text-slate-900">{otpPendingEmail || email}</strong>
          </p>
        </div>

        {/* Security Notification Banner with OTP */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border border-blue-200 shadow-sm space-y-1.5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
            Obsidiuss One-Time Code
          </span>
          <div className="text-2xl font-mono font-black text-blue-700 tracking-[0.25em]">
            {expectedOtp}
          </div>
          <p className="text-[11px] text-slate-500">
            Enter this 6-digit verification code below to confirm your login.
          </p>
        </div>

        <form onSubmit={handleOtpVerify} className="space-y-4">
          {/* 6 Digit Input Boxes */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  otpInputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono font-black text-lg sm:text-xl rounded-xl bg-slate-50 border border-slate-200 text-slate-950 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-xs"
              />
            ))}
          </div>

          {errorDetails && (
            <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-xs text-pink-900 space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 text-pink-600 shrink-0" />
                <span>{errorDetails.message}</span>
              </div>
              {errorDetails.tip && <p className="text-[11px] text-pink-700 pl-5">{errorDetails.tip}</p>}
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition active:scale-[0.99]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify OTP &amp; Enter</span>
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={otpCountdown > 0}
              className={`inline-flex items-center gap-1.5 font-semibold transition ${
                otpCountdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{otpCountdown > 0 ? `Resend OTP in ${otpCountdown}s` : 'Resend OTP Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorDetails(null);
              }}
              className="font-semibold text-slate-500 hover:text-slate-800"
            >
              Use different email
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100/90 border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorDetails(null);
            setInfoMsg(null);
          }}
          className={`min-h-[40px] py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            mode === 'signin'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorDetails(null);
            setInfoMsg(null);
          }}
          className={`min-h-[40px] py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            mode === 'signup'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('reset');
            setErrorDetails(null);
            setInfoMsg(null);
          }}
          className={`min-h-[40px] py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            mode === 'reset'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Forgot Password
        </button>
      </div>

      {/* Google Sign-In Button */}
      {mode !== 'reset' && (
        <div className="space-y-3.5">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full min-h-[46px] flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-blue-50/40 text-slate-900 border border-slate-200 hover:border-blue-300 font-bold text-sm shadow-sm transition active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
            <span>{submitting ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="px-3 text-[11px] font-semibold text-slate-400 bg-white uppercase tracking-wider">
              or continue with email &amp; OTP
            </span>
            <div className="w-full border-t border-slate-200" />
          </div>
        </div>
      )}

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <div className="animate-fade-up">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Community Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. PixelCrafter, DevSpeed"
                maxLength={80}
                required
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
              autoComplete="email"
              className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
            />
          </div>
        </div>

        {mode !== 'reset' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setErrorDetails(null);
                    setInfoMsg(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="w-full min-h-[44px] pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-[11px] text-slate-500 mt-1">Must be at least 6 characters.</p>
            )}
          </div>
        )}

        {/* Error message card */}
        {errorDetails && (
          <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 text-xs text-pink-900 space-y-1 animate-fade-up">
            <div className="flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
              <span>{errorDetails.message}</span>
            </div>
            {errorDetails.tip && (
              <div className="flex items-start gap-1.5 text-[11px] text-pink-700 pl-6">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-pink-500" />
                <span>{errorDetails.tip}</span>
              </div>
            )}
          </div>
        )}

        {/* Info / Success message */}
        {infoMsg && (
          <div className="flex items-start gap-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 animate-fade-up">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-50"
        >
          <span>
            {submitting
              ? 'Processing...'
              : mode === 'signin'
              ? 'Continue to OTP Verification'
              : mode === 'signup'
              ? 'Create Account & Verify OTP'
              : 'Send Password Reset Email'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {mode === 'reset' && (
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorDetails(null);
            }}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            ← Return to Sign In
          </button>
        )}
      </form>

      {/* Community Rules Link */}
      {onOpenRules && (
        <div className="pt-3 text-center border-t border-slate-100 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenRules}
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-blue-600 font-semibold transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-orange-500" />
            <span>Community Rules &amp; Code of Conduct</span>
          </button>
        </div>
      )}
    </div>
  );
};
