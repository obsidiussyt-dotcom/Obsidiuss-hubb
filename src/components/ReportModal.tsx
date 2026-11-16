import React, { useState, useEffect } from 'react';
import { X, Flag, ShieldAlert } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetTitle: string;
  targetType?: 'resource' | 'discussion' | 'comment' | 'review' | 'reel' | 'chat';
  openAuth?: () => void;
}

const getDefaultReason = (
  targetType: 'resource' | 'discussion' | 'comment' | 'review' | 'reel' | 'chat'
) => {
  switch (targetType) {
    case 'review':
    case 'comment':
    case 'chat':
      return 'Inappropriate language or harassment';
    case 'discussion':
    case 'reel':
      return 'Spam or unauthorized advertising';
    case 'resource':
    default:
      return 'Broken download link';
  }
};

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetTitle,
  targetType = 'resource',
  openAuth,
}) => {
  const { submitReport } = useData();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [reason, setReason] = useState(() => getDefaultReason(targetType));
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason(getDefaultReason(targetType));
      setDetails('');
    }
  }, [isOpen, targetType, targetId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      showToast('Please sign in to submit a moderation report.', 'info');
      onClose();
      openAuth?.();
      return;
    }

    setSubmitting(true);
    try {
      await submitReport({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });
      showToast('Report submitted to the administrator moderation queue.', 'success');
      setDetails('');
      onClose();
    } catch {
      showToast('Could not submit report. Please verify you are signed in.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const targetTypeLabel =
    targetType === 'review'
      ? 'Review'
      : targetType === 'comment'
      ? 'Comment'
      : targetType === 'discussion'
      ? 'Discussion'
      : targetType === 'reel'
      ? 'Reel'
      : targetType === 'chat'
      ? 'Chat Message'
      : 'Resource';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md glass-panel rounded-3xl border border-white/10 shadow-2xl bg-[#0d0e17] text-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Report {targetTypeLabel}</h3>
              <p className="text-xs text-zinc-400 truncate max-w-[240px]">
                Target: {targetTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!profile ? (
          <div className="p-6 space-y-4 text-center">
            <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-xs text-zinc-300 leading-relaxed">
              Sign in with Google to submit verified moderation reports and help keep the community safe.
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuth?.();
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
              >
                Sign In with Google
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="Broken download link" className="bg-zinc-900">Broken or offline download link</option>
                <option value="Malicious or corrupted file" className="bg-zinc-900">Malicious or corrupted file</option>
                <option value="Outdated or misleading version" className="bg-zinc-900">Outdated or misleading version</option>
                <option value="Inappropriate language or harassment" className="bg-zinc-900">Inappropriate language or harassment</option>
                <option value="Spam or unauthorized advertising" className="bg-zinc-900">Spam or unauthorized advertising</option>
                <option value="Other concern" className="bg-zinc-900">Other concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Provide extra context to help our administrators investigate..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Send Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
