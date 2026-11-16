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
import { RoleBadge } from '../components/RoleBadge';
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
    <div className="relative min-h-[100dvh] flex items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden bg-gradient-to-br from-[#f8faff] via-[#eff6ff] to-[#fff5f8]">
      {/* Animated Floating Ambient Halos (Blue, Pink, Orange) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-float-slow absolute -top-24 -left-16 w-[440px] h-[440px] rounded-full bg-blue-500/15 blur-[110px]" />
        <div
          className="animate-float-slow absolute top-1/3 right-0 w-[360px] h-[360px] rounded-full bg-pink-500/12 blur-[110px]"
          style={{ animationDelay: '-2.5s' }}
        />
        <div
          className="animate-float-slow -bottom-24 left-1/3 w-[380px] h-[380px] rounded-full bg-orange-400/14 blur-[110px]"
          style={{ animationDelay: '-5s' }}
        />
      </div>

      <div className="max-w-5xl w-full mx-auto relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Auth Card — First on Mobile (order-1 lg:order-2) for immediate one-thumb access */}
        <div className="animate-fade-up order-1 lg:order-2 lg:col-span-6 rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-blue-950/10 overflow-hidden flex flex-col">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-pink-500 to-orange-500 animate-gradient-flow" />
          <div className="p-6 sm:p-9 flex-1 flex flex-col justify-center">
            {/* Mobile-only compact brand header */}
            <div className="flex lg:hidden items-center gap-3 pb-5 mb-5 border-b border-slate-100">
              <BrandLogo size={42} />
              <div>
                <p className="font-display text-base font-black tracking-tight text-slate-950">
                  OBSIDIUSS HUB
                </p>
                <p className="text-xs text-slate-500">Owner: Bhaskar Yadav (Obsidiuss)</p>
              </div>
            </div>

            {profile && isVerifiedUser && !isGate ? (
              <div className="space-y-6 text-center">
                <UserAvatar
                  src={profile.photoURL}
                  name={profile.displayName}
                  sizeClass="w-20 h-20 text-2xl"
                  className="rounded-2xl mx-auto ring-4 ring-blue-100 shadow-lg"
                />
                <div className="space-y-1">
                  <h2 className="font-display text-xl font-black text-slate-950">
                    Welcome back, {profile.displayName}
                  </h2>
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <RoleBadge role={profile.role} size="sm" />
                    <span className="text-xs text-slate-500 font-mono">({profile.email})</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('dashboard')}
                    className="min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-md shadow-blue-600/20 transition"
                  >
                    <span>Open Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('chat')}
                    className="min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-800 text-xs font-semibold transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Live Chat</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 transition"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isGate ? 'Sign In or Register to Enter' : 'Member Access'}</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Welcome to{' '}
                    <span className="bg-gradient-to-r from-blue-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                      OBSIDIUSS HUB
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Continue with Google or Email &amp; Password to unlock the full platform.
                  </p>
                </div>

                <AuthExperience
                  onSuccess={() => onNavigate?.('home')}
                  onOpenRules={onOpenRules}
                />
              </div>
            )}
          </div>
        </div>

        {/* Showcase Column (order-2 lg:order-1) */}
        <div
          className="animate-fade-up order-2 lg:order-1 lg:col-span-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-white/95 via-blue-50/60 to-white/95 backdrop-blur-xl p-6 sm:p-9 shadow-xl shadow-blue-950/[0.06] flex flex-col justify-between gap-6"
          style={{ animationDelay: '70ms' }}
        >
          <div className="space-y-5">
            {!isGate && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Overview</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-3.5">
              <BrandLogo size={50} />
              <div>
                <p className="font-display text-lg font-black tracking-tight text-slate-950">
                  OBSIDIUSS HUB
                </p>
                <p className="text-xs text-slate-500">
                  Owner: <span className="text-slate-900 font-bold">Bhaskar Yadav</span> (Obsidiuss)
                </p>
              </div>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight text-slate-950 leading-[1.12] [text-wrap:balance]">
              Software,{' '}
              <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                Reels
              </span>
              , Live Chat &amp;{' '}
              <span className="text-blue-600">Direct Messages</span>.
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in or create an account to enter OBSIDIUSS HUB — explore verified builds, swipe
              through vertical creator reels, chat live with members, and send private DMs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/80">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5 hover:-translate-y-0.5 transition-transform">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Live Chat &amp; DMs</p>
              <p className="text-[11px] text-slate-500">Real-time rooms &amp; private inbox.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5 hover:-translate-y-0.5 transition-transform">
              <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Instagram-Style Reels</p>
              <p className="text-[11px] text-slate-500">Vertical clips, likes &amp; comments.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5 hover:-translate-y-0.5 transition-transform">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Verified Releases</p>
              <p className="text-[11px] text-slate-500">Mods, apps &amp; user reviews.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5 hover:-translate-y-0.5 transition-transform">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Member Profile</p>
              <p className="text-[11px] text-slate-500">Avatar, bio &amp; activity log.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
