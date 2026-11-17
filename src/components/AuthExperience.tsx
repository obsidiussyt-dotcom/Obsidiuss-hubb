import React, { useState, useEffect } from 'react';
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
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthExperienceProps {
  onSuccess?: () => void;
  onOpenRules?: () => void;
  compact?: boolean;
}

type AuthMode = 'otp-link' | 'signin' | 'signup' | 'reset';

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
        tip: 'Switch to "Email OTP" or "Register" to create your free member account.',
      };
    case 'auth/email-already-in-use':
      return {
        message: 'An account with this email already exists.',
        tip: 'Switch to "Password" sign-in or use "Email OTP".',
      };
    case 'auth/weak-password':
      return {
        message: 'Password is too weak. Please use at least 6 characters.',
      };
    case 'auth/invalid-email':
      return {
        message: 'Please enter a valid email address format (e.g. name@domain.com).',
      };
    case 'auth/expired-action-code':
    case 'auth/invalid-action-code':
      return {
        message: 'This OTP sign-in link has expired or was already used.',
        tip: 'Request a fresh Email OTP link below.',
      };
    case 'auth/too-many-requests':
      return {
        message: 'Too many requests. Please wait a moment before trying again.',
      };
    case 'auth/operation-not-allowed':
      return {
        message: 'This email sign-in method is not yet enabled in your Firebase project.',
        tip: 'In Firebase Console → Authentication → Sign-in method → Email/Password, enable both Email/Password and Email link (passwordless sign-in).',
      };
    case 'auth/unauthorized-domain':
    case 'auth/unauthorized-continue-uri': {
      const host =
        typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return {
        message: `Domain "${host}" is not allowlisted yet in Firebase Authentication.`,
        tip: `In Firebase Console (obsidiuss-hub) → Authentication → Settings → Authorized domains, click "Add domain" and enter: ${host} (or use Password / Register in the meantime).`,
      };
    }
    case 'auth/popup-blocked':
      return {
        message: 'Google Sign-In popup was blocked by your browser.',
        tip: 'Allow popups for this site and click Continue with Google again.',
      };
    case 'auth/popup-closed-by-user':
      return {
        message: 'Google Sign-In window was closed before completing.',
      };
    case 'auth/account-exists-with-different-credential':
      return {
        message: 'An account already exists with this email using a different sign-in provider.',
        tip: 'Try signing in with Google or Email OTP.',
      };
    case 'auth/network-request-failed':
      return {
        message: 'Network error. Please check your internet connection.',
      };
    default:
      return {
        message: err?.message || 'Authentication failed. Please try again.',
      };
  }
}

export const AuthExperience: React.FC<AuthExperienceProps> = ({
  onSuccess,
  onOpenRules,
  compact = false,
}) => {
  const {
    pendingEmailLinkPrompt,
    emailLinkError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendEmailOtpLink,
    completeEmailOtpLink,
    dismissEmailLinkPrompt,
    sendPasswordReset,
  } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>('otp-link');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmLinkEmail, setConfirmLinkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ message: string; tip?: string } | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Real Firebase Email Link OTP dispatch state
  const [otpLinkSentTo, setOtpLinkSentTo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer: ReturnType<typeof setTimeout> = setTimeout(
      () => setResendCooldown((prev) => prev - 1),
      1000
    );
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleGoogle = async () => {
    setErrorDetails(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      showToast('Signed in with Google!', 'success');
      onSuccess?.();
    } catch (err: any) {
      const errInfo = mapFirebaseAuthError(err);
      setErrorDetails(errInfo);
      showToast(errInfo.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteCrossDeviceLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setSubmitting(true);
    try {
      await completeEmailOtpLink(confirmLinkEmail);
      showToast('Email verified and signed in!', 'success');
      onSuccess?.();
    } catch (err: any) {
      setErrorDetails(mapFirebaseAuthError(err));
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
      if (mode === 'otp-link') {
        await sendEmailOtpLink(cleanEmail, displayName);
        setOtpLinkSentTo(cleanEmail);
        setResendCooldown(30);
        showToast(`One-time sign-in link sent to ${cleanEmail}`, 'success');
      } else if (mode === 'reset') {
        await sendPasswordReset(cleanEmail);
        setInfoMsg(`Password reset link sent to ${cleanEmail}. Check your inbox & spam folder.`);
        showToast('Password reset link sent.', 'success');
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setErrorDetails({ message: 'Password must be at least 6 characters long.' });
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(cleanEmail, password, displayName);
        showToast('Account created! Welcome to OBSIDIUSS HUB.', 'success');
        onSuccess?.();
      } else {
        await signInWithEmail(cleanEmail, password);
        showToast('Welcome back! Signed in.', 'success');
        onSuccess?.();
      }
    } catch (err: any) {
      const errInfo = mapFirebaseAuthError(err);
      setErrorDetails(errInfo);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtpLink = async () => {
    if (!otpLinkSentTo || resendCooldown > 0) return;
    setSubmitting(true);
    setErrorDetails(null);
    try {
      await sendEmailOtpLink(otpLinkSentTo, displayName);
      setResendCooldown(30);
      showToast(`Fresh OTP link sent to ${otpLinkSentTo}`, 'success');
    } catch (err: any) {
      setErrorDetails(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Screen 1: Completing a Firebase Email OTP link opened from another browser/device
  if (pendingEmailLinkPrompt) {
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Confirm Your Email to Finish Sign-In</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            For your security, re-enter the email address where you received this one-time sign-in
            link.
          </p>
        </div>

        {(emailLinkError || errorDetails) && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorDetails?.message || emailLinkError}</span>
            </div>
            {errorDetails?.tip && (
              <p className="text-[11px] text-rose-700 pl-6">{errorDetails.tip}</p>
            )}
          </div>
        )}

        <form onSubmit={handleCompleteCrossDeviceLink} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={confirmLinkEmail}
                onChange={(e) => setConfirmLinkEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? 'Verifying...' : 'Verify & Enter Hub'}</span>
          </button>

          <button
            type="button"
            onClick={dismissEmailLinkPrompt}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            Cancel and return to sign-in
          </button>
        </form>
      </div>
    );
  }

  // Screen 2: Email OTP Link Dispatched Screen
  if (otpLinkSentTo) {
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-black text-slate-950">
            Check Your Email Inbox
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Firebase Authentication sent a secure one-time sign-in link to{' '}
            <strong className="text-slate-950">{otpLinkSentTo}</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-bold text-blue-800">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>One-Tap Verified Access</span>
          </div>
          <p className="leading-relaxed">
            Click the sign-in link in your email (also check Spam / Promotions). You will be signed
            in immediately with full member permissions—no password required.
          </p>
        </div>

        {errorDetails && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorDetails.message}</span>
            </div>
            {errorDetails.tip && <p className="text-[11px] text-rose-700 pl-6">{errorDetails.tip}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleResendOtpLink}
            disabled={submitting || resendCooldown > 0}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP Link'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOtpLinkSentTo(null);
              setErrorDetails(null);
            }}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Use Another Method
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {/* Google OAuth CTA */}
      {mode !== 'reset' && (
        <div className="space-y-3.5">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full min-h-[46px] flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-blue-50/50 text-slate-900 border border-slate-200 hover:border-blue-300 font-bold text-sm shadow-xs transition active:scale-[0.99] disabled:opacity-50"
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
            <span className="px-3 text-[11px] font-semibold text-slate-400 bg-white uppercase tracking-wider whitespace-nowrap">
              or continue with email
            </span>
            <div className="w-full border-t border-slate-200" />
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setMode('otp-link');
            setErrorDetails(null);
            setInfoMsg(null);
          }}
          className={`min-h-[38px] py-1.5 px-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1 ${
            mode === 'otp-link'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Email OTP</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorDetails(null);
            setInfoMsg(null);
          }}
          className={`min-h-[38px] py-1.5 px-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            mode === 'signin'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorDetails(null);
            setInfoMsg(null);
          }}
          className={`min-h-[38px] py-1.5 px-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            mode === 'signup'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Register
        </button>
      </div>

      {/* Main Email Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {(mode === 'signup' || mode === 'otp-link') && (
          <div className="animate-fade-up">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Display Name {mode === 'otp-link' && <span className="text-slate-400 font-normal">(optional)</span>}
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. PixelCrafter, DevSpeed"
                maxLength={80}
                required={mode === 'signup'}
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition"
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
              className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition"
            />
          </div>
        </div>

        {(mode === 'signin' || mode === 'signup') && (
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
                className="w-full min-h-[44px] pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition"
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
          </div>
        )}

        {mode === 'otp-link' && (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Firebase will send a verified one-time sign-in link to your email. No password needed.
          </p>
        )}

        {/* Error message card */}
        {errorDetails && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1 animate-fade-up">
            <div className="flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorDetails.message}</span>
            </div>
            {errorDetails.tip && (
              <div className="flex items-start gap-1.5 text-[11px] text-rose-700 pl-6">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
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
          className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition active:scale-[0.99] disabled:opacity-50"
        >
          <span>
            {submitting
              ? 'Sending...'
              : mode === 'otp-link'
              ? 'Send One-Time Sign-In Link'
              : mode === 'signin'
              ? 'Sign In to Hub'
              : mode === 'signup'
              ? 'Create Member Account'
              : 'Send Password Reset Link'}
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
        <div className="pt-3 text-center border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenRules}
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-blue-600 font-semibold transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Community Rules &amp; Code of Conduct</span>
          </button>
        </div>
      )}
    </div>
  );
};
