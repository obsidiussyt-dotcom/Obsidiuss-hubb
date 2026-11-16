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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="animate-modal-pop relative w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl shadow-blue-950/20 bg-white text-slate-900 overflow-hidden max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-pink-500 to-orange-500" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <BrandLogo size={42} />
            <div>
              <h3 className="font-display text-lg font-extrabold text-slate-950">OBSIDIUSS HUB</h3>
              <p className="text-xs text-slate-500">By Bhaskar Yadav (Obsidiuss)</p>
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
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition"
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
