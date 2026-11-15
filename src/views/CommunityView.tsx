import React, { useState, useMemo } from 'react';
import {
  Users,
  MessageSquare,
  Heart,
  Pin,
  Lock,
  Unlock,
  Plus,
  MessageCircle,
  Share2,
  Flag,
  ArrowLeft,
  Send,
  ExternalLink,
  Edit3,
  Trash2,
  Save,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Discussion, Comment } from '../types';
import { CreateDiscussionModal } from '../components/CreateDiscussionModal';
import { UserAvatar } from '../components/UserAvatar';
import type { NavigateOptions } from '../App';
import { buildHref } from '../App';

interface CommunityViewProps {
  openAuth: () => void;
  onOpenReport: (targetId: string, title: string, type: 'discussion' | 'comment') => void;
  onOpenRules: () => void;
  selectedThreadId?: string | null;
  onThreadChange?: (threadId: string | null) => void;
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  openAuth,
  onOpenReport,
  onOpenRules,
  selectedThreadId = null,
  onThreadChange,
  onNavigate,
}) => {
  const {
    discussions,
    loading,
    likedDiscussionIds,
    toggleDiscussionLike,
    getCommentsForDiscussion,
    addComment,
    deleteComment,
    updateDiscussion,
    deleteDiscussion,
  } = useData();
  const { profile, user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedThreadId);
  const selectedDiscussionId = onThreadChange ? selectedThreadId : localSelectedId;
  const selectDiscussion = (id: string | null) => {
    setLocalSelectedId(id);
    onThreadChange?.(id);
  };
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit thread state
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [confirmDeleteThread, setConfirmDeleteThread] = useState(false);
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<string | null>(null);

  const selectedDiscussion = useMemo(
    () => discussions.find((d) => d.id === selectedDiscussionId) || null,
    [discussions, selectedDiscussionId]
  );

  React.useEffect(() => {
    if (!selectedDiscussionId) {
      setComments([]);
      return;
    }
    const unsub = getCommentsForDiscussion(selectedDiscussionId, (loadedComments) => {
      setComments(loadedComments);
    });
    return () => unsub();
  }, [selectedDiscussionId, getCommentsForDiscussion]);

  const categories = ['All', 'General', 'Minecraft', 'Android', 'PC Tools', 'Support', 'Suggestions'];

  const filteredDiscussions = useMemo(() => {
    return discussions
      .filter((d) => (activeCategory === 'All' ? true : d.category === activeCategory))
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [discussions, activeCategory]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      openAuth();
      return;
    }
    if (!newCommentText.trim() || !selectedDiscussion) return;

    setSubmittingComment(true);
    try {
      await addComment(selectedDiscussion.id, newCommentText.trim());
      setNewCommentText('');
      showToast('Reply posted!', 'success');
    } catch {
      showToast('Could not post reply. Please try again.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeDiscussion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile) {
      showToast('Sign in with Google to like discussions.', 'info');
      openAuth();
      return;
    }
    try {
      const liked = await toggleDiscussionLike(id);
      showToast(liked ? 'Liked discussion!' : 'Like removed.', 'info');
    } catch {
      showToast('Could not update like.', 'error');
    }
  };

  const handleShareDiscussion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard && selectedDiscussion) {
      const shareUrl = `${window.location.origin}${buildHref('community', { threadId: selectedDiscussion.id })}`;
      navigator.clipboard.writeText(shareUrl);
      showToast('Direct link to discussion copied!', 'success');
    }
  };

  const handleSaveThreadEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscussion || !editTitle.trim() || !editContent.trim()) return;
    try {
      await updateDiscussion(selectedDiscussion.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      setIsEditingThread(false);
      showToast('Discussion updated!', 'success');
    } catch {
      showToast('Could not update discussion.', 'error');
    }
  };

  const handleDeleteThread = async () => {
    if (!selectedDiscussion) return;
    try {
      await deleteDiscussion(selectedDiscussion.id);
      selectDiscussion(null);
      setConfirmDeleteThread(false);
      showToast('Discussion deleted.', 'info');
    } catch {
      showToast('Could not delete discussion.', 'error');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedDiscussion) return;
    try {
      await deleteComment(selectedDiscussion.id, commentId);
      setConfirmDeleteCommentId(null);
      showToast('Reply deleted.', 'info');
    } catch {
      showToast('Could not delete reply.', 'error');
    }
  };

  // Thread Detail View
  if (selectedDiscussion) {
    const canModifyThread =
      isAdmin || (Boolean(user) && selectedDiscussion.authorId === user?.uid);
    const isLiked = likedDiscussionIds.has(selectedDiscussion.id);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <button
          onClick={() => {
            selectDiscussion(null);
            setIsEditingThread(false);
            setConfirmDeleteThread(false);
          }}
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Discussions</span>
        </button>

        {/* Main Thread Card */}
        <div className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={selectedDiscussion.authorAvatar}
                name={selectedDiscussion.authorName}
                sizeClass="w-11 h-11 text-sm"
                className="rounded-2xl ring-2 ring-purple-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {selectedDiscussion.authorName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      selectedDiscussion.authorRole === 'Creator'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : selectedDiscussion.authorRole === 'Admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : selectedDiscussion.authorRole === 'VIP'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-white/10 text-zinc-300'
                    }`}
                  >
                    {selectedDiscussion.authorRole}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  Posted {new Date(selectedDiscussion.createdAt).toLocaleDateString()} in{' '}
                  <span className="text-purple-400 font-semibold">{selectedDiscussion.category}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {selectedDiscussion.pinned && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Pin className="w-3.5 h-3.5" /> Pinned
                </span>
              )}
              {selectedDiscussion.locked && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Lock className="w-3.5 h-3.5" /> Locked
                </span>
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={() =>
                      updateDiscussion(selectedDiscussion.id, {
                        pinned: !selectedDiscussion.pinned,
                      })
                    }
                    className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 transition"
                    title={selectedDiscussion.pinned ? 'Unpin thread' : 'Pin thread'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      updateDiscussion(selectedDiscussion.id, {
                        locked: !selectedDiscussion.locked,
                      })
                    }
                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 transition"
                    title={selectedDiscussion.locked ? 'Unlock thread' : 'Lock thread'}
                  >
                    {selectedDiscussion.locked ? (
                      <Unlock className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </button>
                </>
              )}

              {canModifyThread && (!selectedDiscussion.locked || isAdmin) && (
                <button
                  onClick={() => {
                    setEditTitle(selectedDiscussion.title);
                    setEditContent(selectedDiscussion.content);
                    setIsEditingThread(!isEditingThread);
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                  title="Edit thread"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {canModifyThread && (
                confirmDeleteThread ? (
                  <div className="flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/30 rounded-lg px-2 py-1">
                    <span className="text-[11px] text-rose-300 font-semibold">Delete?</span>
                    <button
                      onClick={handleDeleteThread}
                      className="text-[11px] font-bold text-rose-400 hover:text-white px-1.5"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDeleteThread(false)}
                      className="text-[11px] text-zinc-400 hover:text-white px-1"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteThread(true)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          </div>

          {isEditingThread ? (
            <form onSubmit={handleSaveThreadEdit} className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={150}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-bold focus:outline-none focus:border-purple-500"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                maxLength={6000}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingThread(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                {selectedDiscussion.title}
              </h1>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {selectedDiscussion.content}
              </p>
            </div>
          )}

          {selectedDiscussion.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedDiscussion.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] text-zinc-400 border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleLikeDiscussion(selectedDiscussion.id, e)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition active:scale-95 ${
                  isLiked
                    ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                    : 'bg-purple-600/10 hover:bg-purple-600/20 border-purple-500/30 text-purple-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-purple-400' : ''}`} />
                <span>{selectedDiscussion.likesCount || 0}</span>
              </button>

              <button
                onClick={handleShareDiscussion}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  onOpenReport(selectedDiscussion.id, selectedDiscussion.title, 'discussion')
                }
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition"
                title="Report topic"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <MessageCircle className="w-4 h-4 text-zinc-400" />
              <span>{comments.length} replies</span>
            </div>
          </div>
        </div>

        {/* Reply Box */}
        {!selectedDiscussion.locked ? (
          <div className="rounded-3xl glass-panel border border-white/10 p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Leave a Reply
            </h3>
            {profile ? (
              <form onSubmit={handlePostComment} className="space-y-3">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or help answer this question..."
                  rows={3}
                  maxLength={2000}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                  required
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    Replying as <strong className="text-purple-300">{profile.displayName}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={submittingComment || !newCommentText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingComment ? 'Sending...' : 'Post Reply'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">
                  Sign in with Google to join the conversation.
                </span>
                <button
                  onClick={openAuth}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition shrink-0"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>This thread is locked. No further replies can be posted.</span>
          </div>
        )}

        {/* Comments Stream */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Community Replies</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-white/10 text-zinc-300">
              {comments.length}
            </span>
          </h3>

          {comments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-panel border border-white/5 text-xs text-zinc-500">
              No replies yet. Be the first to reply!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const canDeleteComment =
                  isAdmin || (Boolean(user) && comment.authorId === user?.uid);
                return (
                  <div
                    key={comment.id}
                    className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          src={comment.authorAvatar}
                          name={comment.authorName}
                          sizeClass="w-7 h-7 text-[11px]"
                          className="rounded-lg"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                              {comment.authorRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {canDeleteComment && (
                          confirmDeleteCommentId === comment.id ? (
                            <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 rounded-lg px-2 py-0.5">
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-[10px] font-bold text-rose-300 hover:text-white"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteCommentId(null)}
                                className="text-[10px] text-zinc-400 hover:text-white ml-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteCommentId(comment.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400"
                              title="Delete reply"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                        <button
                          onClick={() =>
                            onOpenReport(comment.id, comment.content.slice(0, 30), 'comment')
                          }
                          className="p-1 text-zinc-500 hover:text-rose-400"
                          title="Report reply"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed pl-9 whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Discussions List View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-cyan-300">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Community Collaboration & Support · Obsidiuss</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Discussions & Architecture Forum
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            Exchange client setup tips, report bugs, discuss mod architecture, suggest new features,
            and collaborate directly with Obsidiuss and the community.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white font-semibold text-xs transition"
          >
            <span>Community Rules</span>
          </button>

          <button
            onClick={() => {
              if (!profile) openAuth();
              else setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Discussion</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full md:w-auto">
          {categories.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <a
          href="https://discord.com/invite/aAgf7bnCNd"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#8e98ff] border border-[#5865F2]/40 text-xs font-bold transition shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Join Discord Chat</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Discussions List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl glass-panel border border-white/5 animate-pulse bg-white/[0.02]"
            />
          ))}
        </div>
      ) : filteredDiscussions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-white/10 space-y-3">
          <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">No discussions yet</p>
          <p className="text-xs text-zinc-400">
            Be the first to start a discussion topic in this category.
          </p>
          <button
            onClick={() => {
              if (!profile) openAuth();
              else setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            Start First Thread
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDiscussions.map((disc) => {
            const isLiked = likedDiscussionIds.has(disc.id);
            return (
              <div
                key={disc.id}
                onClick={() => selectDiscussion(disc.id)}
                className="p-5 rounded-2xl glass-panel glass-panel-hover cursor-pointer border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
              >
                <div className="flex items-start gap-4">
                  <UserAvatar
                    src={disc.authorAvatar}
                    name={disc.authorName}
                    sizeClass="w-10 h-10 text-xs"
                    className="rounded-xl ring-1 ring-purple-500/30"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {disc.pinned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      {disc.locked && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                      <span className="uppercase text-[10px] font-bold text-purple-400 px-1.5 py-0.5 rounded bg-purple-500/10">
                        {disc.category}
                      </span>
                      <span className="text-xs text-zinc-400">
                        By <strong className="text-zinc-200">{disc.authorName}</strong>
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        • {new Date(disc.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white hover:text-purple-300 transition">
                      {disc.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1 max-w-2xl">
                      {disc.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                  <button
                    onClick={(e) => handleLikeDiscussion(disc.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isLiked
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                        : 'bg-white/[0.04] hover:bg-purple-600/20 text-purple-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-purple-400' : ''}`} />
                    <span className="font-mono">{disc.likesCount || 0}</span>
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] text-zinc-400 text-xs font-semibold">
                    <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-mono">{disc.repliesCount || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Related Internal Resources */}
      <div className="p-5 rounded-3xl glass-panel border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-zinc-400">
          Need downloads, latest patch notes, or private feedback channels?
        </p>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/resources"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('resources');
            }}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-200 transition"
          >
            Browse Resources
          </a>
          <a
            href="/announcements"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('announcements');
            }}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-200 transition"
          >
            Platform Updates
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('contact');
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-200 transition"
          >
            Contact Form
          </a>
        </div>
      </div>
    </div>
  );
};
