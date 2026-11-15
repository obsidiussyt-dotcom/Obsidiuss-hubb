import React, { useState } from 'react';
import { X, MessageSquarePlus, Tag, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Discussion } from '../types';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addDiscussion } = useData();
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Discussion['category']>('General');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please provide a title and topic content.', 'error');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setSubmitting(true);
    try {
      await addDiscussion({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.length > 0 ? tags : ['General'],
      });
      showToast('Discussion topic published!', 'success');
      setTitle('');
      setContent('');
      setTagsInput('');
      onSuccess();
      onClose();
    } catch {
      showToast('Failed to post discussion. Please check your credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl glass-panel rounded-3xl border border-white/10 shadow-2xl bg-[#0d0e17] text-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Start New Discussion</h3>
              <p className="text-xs text-zinc-400">Share with the OBSIDIUSS community</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Topic Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best settings for 240FPS on Bedwars with FPS Booster?"
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Discussion['category'])}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="General" className="bg-zinc-900">General Discussion</option>
                <option value="Minecraft" className="bg-zinc-900">Minecraft Mods & Clients</option>
                <option value="Android" className="bg-zinc-900">Android APKs & Tweaks</option>
                <option value="PC Tools" className="bg-zinc-900">PC Software & Tools</option>
                <option value="Support" className="bg-zinc-900">Help & Support</option>
                <option value="Suggestions" className="bg-zinc-900">Feature Suggestions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="PVP, Sodium, FPS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Explain your topic, question, or idea in detail. Be friendly and constructive!"
              maxLength={5000}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-500">
              Posting as: <span className="text-purple-300 font-semibold">{profile?.displayName || 'Guest'}</span>
            </span>
            <div className="flex items-center gap-2">
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Create Topic'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
