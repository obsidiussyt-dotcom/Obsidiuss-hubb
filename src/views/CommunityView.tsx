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
import { Comment } from '../types';
import { CreateDiscussionModal } from '../components/CreateDiscussionModal';
import { UserAvatar } from '../components/UserAvatar';
import { RoleBadge } from '../components/RoleBadge';
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
      showToast('Sign in to like discussions.', 'info');
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fade-up">
        <button
          onClick={() => {
            selectDiscussion(null);
            setIsEditingThread(false);
            setConfirmDeleteThread(false);
          }}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Discussions</span>
        </button>

        {/* Main Thread Card */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={selectedDiscussion.authorAvatar}
                name={selectedDiscussion.authorName}
                sizeClass="w-11 h-11 text-sm"
                className="rounded-2xl ring-2 ring-blue-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-950">
                    {selectedDiscussion.authorName}
                  </span>
                  <RoleBadge role={selectedDiscussion.authorRole} size="xs" />
                </div>
                <span className="text-[11px] text-slate-500">
                  Posted {new Date(selectedDiscussion.createdAt).toLocaleDateString()} in{' '}
                  <span className="text-blue-600 font-semibold">{selectedDiscussion.category}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {selectedDiscussion.pinned && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  <Pin className="w-3.5 h-3.5" /> Pinned
                </span>
              )}
              {selectedDiscussion.locked && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
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
                    className="p-2 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition"
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
                    className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
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
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
                  title="Edit thread"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {canModifyThread && (
                confirmDeleteThread ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
                    <span className="text-[11px] text-rose-700 font-semibold">Delete?</span>
                    <button
                      onClick={handleDeleteThread}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 px-1.5"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDeleteThread(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-900 px-1"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteThread(true)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-sm font-bold focus:outline-none focus:border-blue-500"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                maxLength={6000}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingThread(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 leading-snug">
                {selectedDiscussion.title}
              </h1>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedDiscussion.content}
              </p>
            </div>
          )}

          {selectedDiscussion.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedDiscussion.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-600 border border-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleLikeDiscussion(selectedDiscussion.id, e)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition active:scale-95 ${
                  isLiked
                    ? 'bg-pink-50 border-pink-300 text-pink-600'
                    : 'bg-slate-50 hover:bg-pink-50 border-slate-200 text-slate-700 hover:text-pink-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-pink-500' : ''}`} />
                <span>{selectedDiscussion.likesCount || 0}</span>
              </button>

              <button
                onClick={handleShareDiscussion}
                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-500 hover:text-blue-600 transition"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  onOpenReport(selectedDiscussion.id, selectedDiscussion.title, 'discussion')
                }
                className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-600 transition"
                title="Report topic"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span>{comments.length} replies</span>
            </div>
          </div>
        </div>

        {/* Reply Box */}
        {!selectedDiscussion.locked ? (
          <div className="rounded-3xl glass-panel p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none"
                  required
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Replying as <strong className="text-blue-600">{profile.displayName}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={submittingComment || !newCommentText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingComment ? 'Sending...' : 'Post Reply'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-600">
                  Sign in to join the conversation.
                </span>
                <button
                  onClick={openAuth}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shrink-0"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>This thread is locked. No further replies can be posted.</span>
          </div>
        )}

        {/* Comments Stream */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
            <span>Community Replies</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-200 text-slate-700">
              {comments.length}
            </span>
          </h3>

          {comments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-panel text-xs text-slate-500">
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
                    className="p-4 sm:p-5 rounded-2xl glass-panel space-y-2.5"
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
                            <span className="text-xs font-bold text-slate-950">
                              {comment.authorName}
                            </span>
                            <RoleBadge role={comment.authorRole} size="xs" />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {canDeleteComment && (
                          confirmDeleteCommentId === comment.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5">
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-[10px] font-bold text-rose-600 hover:text-rose-800"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteCommentId(null)}
                                className="text-[10px] text-slate-500 hover:text-slate-900 ml-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteCommentId(comment.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
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
                          className="p-1 text-slate-400 hover:text-pink-600"
                          title="Report reply"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pl-9 whitespace-pre-line">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-600">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Community Collaboration &amp; Support · Obsidiuss</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Discussions &amp; Architecture Forum
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Exchange client setup tips, report bugs, discuss mod architecture, suggest new features,
            and collaborate directly with Bhaskar Yadav (Obsidiuss) and the community.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 font-semibold text-xs shadow-sm transition"
          >
            <span>Community Rules</span>
          </button>

          <button
            onClick={() => {
              if (!profile) openAuth();
              else setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition shrink-0 active:scale-95"
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
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
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
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition shrink-0"
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
              className="h-24 rounded-2xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : filteredDiscussions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
          <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-950">No discussions yet</p>
          <p className="text-xs text-slate-500">
            Be the first to start a discussion topic in this category.
          </p>
          <button
            onClick={() => {
              if (!profile) openAuth();
              else setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
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
                className="p-5 rounded-2xl glass-panel glass-panel-hover cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
              >
                <div className="flex items-start gap-4">
                  <UserAvatar
                    src={disc.authorAvatar}
                    name={disc.authorName}
                    sizeClass="w-10 h-10 text-xs"
                    className="rounded-xl ring-1 ring-blue-200"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {disc.pinned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      {disc.locked && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                      <span className="uppercase text-[10px] font-bold text-blue-700 px-1.5 py-0.5 rounded bg-blue-50">
                        {disc.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        By <strong className="text-slate-900">{disc.authorName}</strong>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        · {new Date(disc.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-950 hover:text-blue-600 transition">
                      {disc.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl">
                      {disc.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <button
                    onClick={(e) => handleLikeDiscussion(disc.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isLiked
                        ? 'bg-pink-50 text-pink-600 border border-pink-200'
                        : 'bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-pink-500' : ''}`} />
                    <span className="font-mono">{disc.likesCount || 0}</span>
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
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
      <div className="p-5 rounded-3xl glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-600">
          Need downloads, latest patch notes, or private feedback channels?
        </p>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/resources"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('resources');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition"
          >
            Browse Resources
          </a>
          <a
            href="/announcements"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('announcements');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition"
          >
            Platform Updates
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('contact');
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 transition"
          >
            Contact Form
          </a>
        </div>
      </div>
    </div>
  );
};
