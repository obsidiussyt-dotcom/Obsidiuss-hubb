import React from 'react';
import {
  MessageSquare,
  Film,
  Download,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { AuthExperience } from '../components/AuthExperience';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import type { NavigateOptions } from '../App';

interface SignInViewProps {
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
  onOpenRules: () => void;
  isGate?: boolean;
}

export const SignInView: React.FC<SignInViewProps> = ({
  onNavigate,
  onOpenRules,
  isGate = false,
}) => {
  const { profile, isVerifiedUser, signOut } = useAuth();

  return (
    <div className="relative min-h-[100dvh] flex items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden bg-[#06070c]">
      {/* Architectural dark studio backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-1/4 w-[420px] h-[420px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute bottom-12 right-1/4 w-[380px] h-[380px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="max-w-5xl w-full mx-auto relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Auth Card — First on Mobile (order-1 lg:order-2) for instant one-thumb access */}
        <div className="order-1 lg:order-2 lg:col-span-6 rounded-3xl border border-white/10 bg-[#0b0c14] p-6 sm:p-9 shadow-2xl flex flex-col justify-center">
          {/* Mobile-only compact header inside Auth Card */}
          <div className="flex lg:hidden items-center gap-3 pb-5 mb-5 border-b border-white/10">
            <BrandLogo size={42} />
            <div>
              <p className="text-base font-black tracking-wider text-white">OBSIDIUSS HUB</p>
              <p className="text-xs text-zinc-400">Owner: Bhaskar Yadav (Obsidiuss)</p>
            </div>
          </div>

          {profile && isVerifiedUser && !isGate ? (
            <div className="space-y-6 text-center">
              <UserAvatar
                src={profile.photoURL}
                name={profile.displayName}
                sizeClass="w-20 h-20 text-2xl"
                className="rounded-2xl mx-auto ring-2 ring-cyan-400/40"
              />
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">Welcome back, {profile.displayName}</h2>
                <p className="text-xs text-zinc-400">
                  {profile.role} · {profile.email}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate?.('dashboard')}
                  className="min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition"
                >
                  <span>Open Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('chat')}
                  className="min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Live Chat</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isGate ? 'Sign In or Register to Enter' : 'Member Access'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Access OBSIDIUSS HUB
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Continue with Google or Email &amp; Password.
                </p>
              </div>

              <AuthExperience
                onSuccess={() => onNavigate?.('home')}
                onOpenRules={onOpenRules}
              />
            </div>
          )}
        </div>

        {/* Showcase Column (order-2 lg:order-1) */}
        <div className="order-2 lg:order-1 lg:col-span-6 rounded-3xl border border-white/10 bg-[#0b0c14]/90 p-6 sm:p-9 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            {!isGate && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Overview</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-3.5">
              <BrandLogo size={48} />
              <div>
                <p className="text-base font-black tracking-wider text-white">OBSIDIUSS HUB</p>
                <p className="text-xs text-zinc-400">
                  Owner: <span className="text-zinc-200 font-semibold">Bhaskar Yadav</span> (Obsidiuss)
                </p>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight [text-wrap:balance]">
              Software, Reels, Live Chat &amp; Direct Messages.
            </h1>

            <p className="text-sm text-zinc-400 leading-relaxed">
              Sign in or create an account to enter OBSIDIUSS HUB — download releases, watch and post
              reels, join live chat rooms, and message members directly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-bold text-white">Live Chat &amp; DMs</p>
              <p className="text-[11px] text-zinc-400">Real-time channels &amp; private inbox.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <Film className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-bold text-white">Reels</p>
              <p className="text-[11px] text-zinc-400">Vertical clips &amp; dev demos.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <Download className="w-4 h-4 text-indigo-400" />
              <p className="text-xs font-bold text-white">Releases</p>
              <p className="text-[11px] text-zinc-400">Verified builds &amp; reviews.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <p className="text-xs font-bold text-white">Member Profile</p>
              <p className="text-[11px] text-zinc-400">Avatar, bio &amp; activity log.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
