import React from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { AuthExperience } from './AuthExperience';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRules?: () => void;
  onOpenFullPage?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenRules,
  onOpenFullPage,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/10 shadow-2xl bg-[#0b0c14] text-zinc-200 overflow-hidden max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <BrandLogo size={42} />
            <div>
              <h3 className="text-lg font-extrabold text-white">OBSIDIUSS HUB</h3>
              <p className="text-xs text-zinc-400">By Bhaskar Yadav (Obsidiuss)</p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="p-6 space-y-4">
          <AuthExperience
            compact
            onSuccess={onClose}
            onOpenRules={() => {
              onClose();
              onOpenRules?.();
            }}
          />

          {onOpenFullPage && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullPage();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-cyan-300 transition"
              >
                <span>Open dedicated Sign-In page</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
