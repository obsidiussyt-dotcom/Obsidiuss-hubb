import React from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  HeartHandshake,
  CheckCircle,
  FileCode,
  ShieldAlert,
  Film,
  Sparkles,
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
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-slate-200 shadow-2xl bg-white text-slate-700 animate-modal-pop flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="sticky top-0 z-10 p-5 sm:p-6 border-b border-slate-200 bg-white/95 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black text-slate-950">
                Community Guidelines &amp; Rules
              </h2>
              <p className="text-xs text-slate-500">Official Standards for OBSIDIUSS HUB</p>
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

        {/* Rules Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed overflow-y-auto">
          {/* Rule 1 */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>1. Modding Safety &amp; Clean Software Policy</span>
            </div>
            <p className="text-slate-700">
              Every tool, Minecraft mod, and Android APK on OBSIDIUSS HUB is verified free from
              malware, token loggers, crypto miners, and adware. Users must never share dangerous
              links, cracked malicious software, or unverified executables in discussions, reels, or
              chat channels.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 space-y-1.5">
            <div className="flex items-center gap-2 text-pink-700 font-bold text-sm">
              <HeartHandshake className="w-4 h-4 text-pink-500 shrink-0" />
              <span>2. Respectful Live Chat &amp; Direct Messaging</span>
            </div>
            <p className="text-slate-700">
              Treat creators, modders, and all community members with respect. Hate speech,
              harassment, spamming, unsolicited advertising in private DMs, and toxic behavior are
              strictly forbidden. Keep channels friendly and focused on gaming, coding, and
              creative work.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-1.5">
            <div className="flex items-center gap-2 text-violet-800 font-bold text-sm">
              <Film className="w-4 h-4 text-violet-600 shrink-0" />
              <span>3. Reels &amp; Video Media Standards</span>
            </div>
            <p className="text-slate-700">
              Creator and member reels should feature gameplay clips, client showcases, modding
              tutorials, and tech demos. Do not upload copyright-infringing content, NSFW material,
              or misleading thumbnails.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
              <FileCode className="w-4 h-4 text-sky-600 shrink-0" />
              <span>4. Fair Attribution &amp; Source Code Integrity</span>
            </div>
            <p className="text-slate-700">
              Templates, scripts, and source codes are shared for education and customization. When
              adapting tools created by Obsidiuss (Bhaskar Yadav), maintain author attribution. Do
              not re-host builds behind deceptive paywalls or spam shorteners.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>5. Bug Reports &amp; Constructive Feedback</span>
            </div>
            <p className="text-slate-700">
              When reporting issues or asking for mod setup assistance, include your game version,
              mod loader (Fabric/Forge), OS, and crash logs. Constructive suggestions help improve
              the platform for everyone.
            </p>
          </div>

          {/* Rule 6 - Admin authority */}
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-1.5 text-orange-950">
            <div className="flex items-center gap-2 font-bold text-sm text-orange-800">
              <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0" />
              <span>6. Moderation &amp; Administration</span>
            </div>
            <p className="text-xs text-orange-900 leading-relaxed">
              The platform administrator (<span className="font-bold">Bhaskar Yadav / Obsidiuss</span>)
              and appointed moderators reserve the right to remove non-compliant content, revoke
              permissions, and suspend accounts that breach these standards to keep the hub safe for
              everyone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-3xl">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Applies to all registered members on OBSIDIUSS HUB</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            I Agree &amp; Understand
          </button>
        </div>
      </div>
    </div>
  );
};
