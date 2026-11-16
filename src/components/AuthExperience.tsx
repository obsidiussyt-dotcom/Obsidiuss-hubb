import React, { useState } from 'react';
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
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthExperienceProps {
  onSuccess?: () => void;
  onOpenRules?: () => void;
  compact?: boolean;
}

type AuthMode = 'signin' | 'signup' | 'reset';

function mapFirebaseAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Console → Authentication → Sign-in method.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In popup was closed before completing.';
    default:
      return err?.message || 'Authentication failed. Please try again.';
  }
}

export const AuthExperience: React.FC<AuthExperienceProps> = ({
  onSuccess,
  onOpenRules,
  compact = false,
}) => {
  const {
    user,
    isVerifiedUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    resendVerificationEmail,
    refreshAuthUser,
    signOut,
  } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleGoogle = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      showToast('Signed in with Google.', 'success');
      onSuccess?.();
    } catch (err: any) {
      const msg = mapFirebaseAuthError(err);
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'reset') {
        await sendPasswordReset(email);
        setInfoMsg('Password reset link sent. Check your inbox (and spam folder).');
        showToast('Password reset email dispatched.', 'success');
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
        setInfoMsg(
          'Account created! We sent a verification link to your email so you can post, chat, and DM.'
        );
        showToast('Account created! Please verify your email.', 'success');
      } else {
        await signInWithEmail(email, password);
        showToast('Signed in successfully.', 'success');
        onSuccess?.();
      }
    } catch (err: any) {
      const msg = mapFirebaseAuthError(err);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setSubmitting(true);
    try {
      await resendVerificationEmail();
      showToast('Verification link sent to your email.', 'success');
      setInfoMsg('Verification email sent. Open the link in your inbox, then click Refresh Status.');
    } catch (err: any) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckVerified = async () => {
    setSubmitting(true);
    try {
      const verified = await refreshAuthUser();
      if (verified) {
        showToast('Email verified! Full hub access unlocked.', 'success');
        onSuccess?.();
      } else {
        setInfoMsg('Not verified yet. Click the link in your inbox and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Signed-in but unverified Email/Password state
  if (user && !isVerifiedUser) {
    return (
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Verify Your Email Address</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            You are signed in as <span className="text-white font-semibold">{user.email}</span>.
            Click the verification link sent to your inbox to unlock Live Chat, Direct Messages,
            Reels, and Community posting.
          </p>
        </div>

        {infoMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300">
            {infoMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleCheckVerified}
            disabled={submitting}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${submitting ? 'animate-spin' : ''}`} />
            <span>I Verified — Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={submitting}
            className="flex-1 min-h-[44px] py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-200 text-xs font-semibold transition disabled:opacity-50"
          >
            Resend Link
          </button>
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          Use a different email or Google account
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      {/* Mode Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          className={`min-h-[40px] py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            mode === 'signin'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          className={`min-h-[40px] py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            mode === 'signup'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Register
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('reset');
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          className={`min-h-[40px] py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            mode === 'reset'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Reset
        </button>
      </div>

      {/* Google OAuth CTA */}
      {mode !== 'reset' && (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full min-h-[46px] flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-sm shadow-lg transition active:scale-[0.99] disabled:opacity-50"
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
            <div className="w-full border-t border-white/10" />
            <span className="px-3 text-[11px] font-medium text-zinc-500 bg-[#0b0c14] whitespace-nowrap">
              or continue with email
            </span>
            <div className="w-full border-t border-white/10" />
          </div>
        </>
      )}

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Choose a community name"
                maxLength={80}
                required
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
              autoComplete="email"
              className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {mode !== 'reset' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="w-full min-h-[44px] pl-10 pr-11 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-indigo-950/50 transition active:scale-[0.99] disabled:opacity-50"
        >
          <span>
            {submitting
              ? 'Processing...'
              : mode === 'signin'
              ? 'Sign In with Email'
              : mode === 'signup'
              ? 'Create Member Account'
              : 'Send Password Reset Link'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {onOpenRules && (
        <div className="pt-3 text-center border-t border-white/10">
          <button
            type="button"
            onClick={onOpenRules}
            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Community & User Guidelines</span>
          </button>
        </div>
      )}
    </div>
  );
};
