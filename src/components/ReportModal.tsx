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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl bg-white text-slate-800 overflow-hidden animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600 border border-pink-200">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-950">Report {targetTypeLabel}</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                Target: {targetTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!profile ? (
          <div className="p-6 space-y-4 text-center">
            <ShieldAlert className="w-8 h-8 text-orange-500 mx-auto" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Sign in to submit verified moderation reports and help keep the community safe.
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuth?.();
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              >
                <option value="Broken download link">Broken or offline download link</option>
                <option value="Malicious or corrupted file">Malicious or corrupted file</option>
                <option value="Outdated or misleading version">Outdated or misleading version</option>
                <option value="Inappropriate language or harassment">Inappropriate language or harassment</option>
                <option value="Spam or unauthorized advertising">Spam or unauthorized advertising</option>
                <option value="Other concern">Other concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Provide extra context to help our administrators investigate..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
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
