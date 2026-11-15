import React from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-panel rounded-3xl border border-white/10 shadow-2xl bg-[#0c0d16] text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-white/10 bg-[#0c0d16]/95 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Community & User Rules</h2>
              <p className="text-xs text-zinc-400">Official Conduct Guidelines for OBSIDIUSS HUB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="p-6 space-y-6 text-xs text-zinc-300 leading-relaxed">
          {/* Rule 1 */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>1. Modding Safety & Clean File Policy</span>
            </div>
            <p className="text-zinc-400">
              Every tool, Minecraft mod, and Android APK on OBSIDIUSS HUB is verified free from
              malware, crypto-miners, and adware. Users must never share malicious links, token
              stealers, or unauthorized cracked software in forum posts or comments.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <HeartHandshake className="w-4 h-4 text-cyan-400" />
              <span>2. Respectful Forum Discussions</span>
            </div>
            <p className="text-zinc-400">
              Treat all creators and community members with dignity. Toxicity, personal insults,
              hate speech, spamming, and harassment will not be tolerated. Keep discussions focused
              on gaming, optimization, and development.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>3. Open Source & Fair Attribution</span>
            </div>
            <p className="text-zinc-400">
              Templates and source code packages are shared for educational and personal learning.
              When incorporating Obsidiuss tools into custom projects, maintain proper author
              attribution. Do not re-upload Obsidiuss builds to paid link-shorteners or commercial
              paywalls.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>4. Bug Reporting & Support Etiquette</span>
            </div>
            <p className="text-zinc-400">
              When reporting crashes or mod conflicts, please specify your game version (e.g. 1.20.4),
              mod loader (Fabric/Forge), operating system, and provide crash logs via the Community
              Forum or official Discord support channels.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-amber-200">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>5. Admin Authority & Moderation</span>
            </div>
            <p className="text-xs text-amber-200/80">
              The platform administrator and designated moderators reserve the right to edit or
              delete any inappropriate topic, remove malicious downloads, and permanently terminate
              accounts that violate these terms.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Effective for all registered users on OBSIDIUSS HUB
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
