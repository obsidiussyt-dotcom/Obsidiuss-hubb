import React from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  HeartHandshake,
  CheckCircle,
  FileCode,
  ShieldAlert,
} from 'lucide-react';

interface CommunityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityRulesModal: React.FC<CommunityRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 shadow-2xl bg-white text-slate-700 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-6 border-b border-slate-200 bg-white/95 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-950">
                Community & User Rules
              </h2>
              <p className="text-xs text-slate-500">Official Conduct Guidelines for OBSIDIUSS HUB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>1. Modding Safety & Clean File Policy</span>
            </div>
            <p>
              Every tool, Minecraft mod, and Android APK on OBSIDIUSS HUB is verified free from
              malware, crypto-miners, and adware. Users must never share malicious links, token
              stealers, or unauthorized cracked software in forum posts, reels, or live chat.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-pink-600 font-bold text-sm">
              <HeartHandshake className="w-4 h-4 text-pink-500" />
              <span>2. Respectful Discussions, Chat & DMs</span>
            </div>
            <p>
              Treat all creators and community members with dignity. Toxicity, personal insults,
              hate speech, spamming, and harassment will not be tolerated. Keep conversations focused
              on gaming, optimization, and development.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <FileCode className="w-4 h-4 text-sky-600" />
              <span>3. Open Source & Fair Attribution</span>
            </div>
            <p>
              Templates and source code packages are shared for educational and personal learning.
              When incorporating Obsidiuss tools into custom projects, maintain proper author
              attribution. Do not re-upload builds to paid link-shorteners or commercial paywalls.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>4. Bug Reporting & Support Etiquette</span>
            </div>
            <p>
              When reporting crashes or mod conflicts, specify your game version, mod loader
              (Fabric/Forge), operating system, and crash details via the Community Forum or
              official Discord support channels.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-2 text-orange-900">
            <div className="flex items-center gap-2 font-bold text-sm text-orange-700">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              <span>5. Admin Authority & Moderation</span>
            </div>
            <p className="text-xs text-orange-800">
              The platform administrator (Bhaskar Yadav / Obsidiuss) and designated moderators
              reserve the right to edit or delete inappropriate content, remove malicious
              downloads, and terminate accounts that violate these rules.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between rounded-b-3xl">
          <span className="text-[11px] text-slate-500">
            Effective for all registered members on OBSIDIUSS HUB
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
