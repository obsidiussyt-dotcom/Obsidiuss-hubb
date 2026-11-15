import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRules?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenRules,
}) => {
  const { signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast('Signed in successfully with Google!', 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('Google Sign-In canceled or blocked by browser popup settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md glass-panel rounded-3xl border border-white/10 shadow-2xl bg-[#0c0d16] text-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-purple-900/40">
              Ω
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">OBSIDIUSS Community</h3>
              <p className="text-xs text-zinc-400">Official Member Authentication</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-6 space-y-5">
          <div className="space-y-2.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Post questions and reply in Community Discussions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Save & bookmark your favorite Minecraft & Android tools</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Personal profile with download history and activity log</span>
            </div>
          </div>

          {/* Primary Action: Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>{loading ? 'Connecting to Google...' : 'Sign In with Google'}</span>
          </button>

          {/* User Guidelines Link */}
          {onOpenRules && (
            <div className="pt-2 text-center border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRules();
                }}
                className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-purple-300 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Official Community & User Rules</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
