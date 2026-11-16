import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Trash2,
  Mail,
  Flag,
  X,
  Upload,
  Send,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Reel, ReelComment } from '../types';
import { UserAvatar } from '../components/UserAvatar';

interface ReelsViewProps {
  openAuth: () => void;
  initialReelId?: string | null;
  onStartDMWithUser: (target: { uid: string; displayName: string; photoURL?: string }) => void;
  onOpenReport?: (
    targetId: string,
    targetTitle: string,
    targetType?: 'resource' | 'discussion' | 'comment' | 'review' | 'reel' | 'chat'
  ) => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId = '';
    if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.replace('/', '');
    } else if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/shorts/')) {
        videoId = u.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      } else if (u.pathname.startsWith('/embed/')) {
        videoId = u.pathname.split('/embed/')[1]?.split('/')[0] || '';
      } else {
        videoId = u.searchParams.get('v') || '';
      }
    }
    if (!videoId) return null;
    const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');
    return `https://www.youtube-nocookie.com/embed/${cleanId}?rel=0&modestbranding=1&playsinline=1`;
  } catch {
    return null;
  }
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  openAuth,
  initialReelId = null,
  onStartDMWithUser,
  onOpenReport,
}) => {
  const { user, isAdmin, isVerifiedUser } = useAuth();
  const {
    reels,
    likedReelIds,
    createReel,
    deleteReel,
    toggleReelLike,
    incrementReelView,
    subscribeReelComments,
    addReelComment,
    deleteReelComment,
    uploadFile,
  } = useData();
  const { showToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Create Reel Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<Reel['category']>('Showcase');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [submittingReel, setSubmittingReel] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const viewedIdsRef = useRef<Set<string>>(new Set());

  const categories = ['All', 'Showcase', 'Minecraft', 'Android', 'Devlog', 'Tutorial'];

  const filteredReels = React.useMemo(() => {
    if (categoryFilter === 'All') return reels;
    return reels.filter((r) => r.category.toLowerCase() === categoryFilter.toLowerCase());
  }, [reels, categoryFilter]);

  // Jump to deep-linked ?reel=<id>
  useEffect(() => {
    if (initialReelId && filteredReels.length > 0) {
      const idx = filteredReels.findIndex((r) => r.id === initialReelId);
      if (idx >= 0) setActiveIndex(idx);
    }
  }, [initialReelId, filteredReels]);

  useEffect(() => {
    if (activeIndex >= filteredReels.length && filteredReels.length > 0) {
      setActiveIndex(0);
    }
  }, [filteredReels.length, activeIndex]);

  const activeReel = filteredReels[activeIndex] || null;

  // Record a single view when viewing a reel
  useEffect(() => {
    if (!activeReel) return;
    setPaused(false);
    if (!viewedIdsRef.current.has(activeReel.id)) {
      viewedIdsRef.current.add(activeReel.id);
      incrementReelView(activeReel.id);
    }
  }, [activeReel?.id, incrementReelView]);

  // Subscribe to comments for active reel when drawer is open
  useEffect(() => {
    if (!activeReel || !commentsOpen) {
      setComments([]);
      return;
    }
    const unsub = subscribeReelComments(activeReel.id, setComments);
    return () => unsub();
  }, [activeReel?.id, commentsOpen, subscribeReelComments]);

  // Keyboard navigation Up/Down
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isCreateOpen) return;
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(filteredReels.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filteredReels.length, isCreateOpen]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
  };

  const handleLike = async (reel: Reel) => {
    if (!user) {
      openAuth();
      return;
    }
    if (!isVerifiedUser) {
      showToast('Please verify your email to like reels.', 'info');
      openAuth();
      return;
    }
    try {
      await toggleReelLike(reel.id);
    } catch {
      showToast('Could not update like.', 'error');
    }
  };

  const handleShare = async (reel: Reel) => {
    const url = `${window.location.origin}/reels?reel=${reel.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Reel link copied to clipboard.', 'success');
    } catch {
      showToast(url, 'info');
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 60 * 1024 * 1024) {
      showToast('Video file must be under 60 MB, or paste a direct/YouTube Shorts link.', 'error');
      return;
    }
    setUploadingVideo(true);
    try {
      const url = await uploadFile(file, 'reels');
      setVideoUrl(url);
      showToast('Video uploaded successfully.', 'success');
    } catch {
      showToast('Storage upload failed. Paste a direct MP4 or YouTube Shorts link instead.', 'error');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuth();
      return;
    }
    if (!isVerifiedUser) {
      showToast('Please verify your email address before posting a reel.', 'info');
      openAuth();
      return;
    }
    if (!title.trim() || !videoUrl.trim()) {
      showToast('Title and video URL are required.', 'error');
      return;
    }

    setSubmittingReel(true);
    try {
      await createReel({
        title,
        caption,
        category,
        videoUrl,
        thumbnailUrl,
      });
      showToast('Reel published live.', 'success');
      setTitle('');
      setCaption('');
      setVideoUrl('');
      setThumbnailUrl('');
      setIsCreateOpen(false);
      setCategoryFilter('All');
      setActiveIndex(0);
    } catch {
      showToast('Could not publish reel. Verify your inputs and try again.', 'error');
    } finally {
      setSubmittingReel(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReel) return;
    if (!user) {
      openAuth();
      return;
    }
    if (!isVerifiedUser) {
      showToast('Verify your email to post comments.', 'info');
      openAuth();
      return;
    }
    if (!commentText.trim()) return;
    try {
      await addReelComment(activeReel.id, commentText);
      setCommentText('');
    } catch {
      showToast('Could not post comment.', 'error');
    }
  };

  const handleDeleteReel = async (reelId: string) => {
    if (confirmDeleteId !== reelId) {
      setConfirmDeleteId(reelId);
      setTimeout(() => setConfirmDeleteId((cur) => (cur === reelId ? null : cur)), 3000);
      return;
    }
    try {
      await deleteReel(reelId);
      setConfirmDeleteId(null);
      showToast('Reel deleted.', 'info');
    } catch {
      showToast('Failed to delete reel.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">
            Short-Form Showcase
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            OBSIDIUSS Reels
          </h1>
          <p className="text-xs text-zinc-400">
            Watch quick client demos, Android builds, devlog clips, and community showcases.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!user) {
              openAuth();
              return;
            }
            if (!isVerifiedUser) {
              showToast('Verify your email to publish a reel.', 'info');
              openAuth();
              return;
            }
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold shadow-lg transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Reel</span>
        </button>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategoryFilter(cat);
              setActiveIndex(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              categoryFilter === cat
                ? 'bg-white text-zinc-950'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stage or Empty State */}
      {filteredReels.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#0b0c14] p-14 text-center space-y-4">
          <Film className="w-12 h-12 text-zinc-600 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">No reels published yet</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Post the first vertical video reel by uploading an MP4 clip or linking a YouTube Short.
            </p>
          </div>
          <button
            type="button"
            onClick={() => (user ? setIsCreateOpen(true) : openAuth())}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Publish First Reel</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Vertical Reel Player Stage */}
          {activeReel && (
            <div className="lg:col-span-7 xl:col-span-6 flex items-center justify-center gap-2.5 sm:gap-4">
              <div className="relative w-full max-w-[295px] sm:max-w-[390px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                {(() => {
                  const ytEmbed = getYouTubeEmbedUrl(activeReel.videoUrl);
                  if (ytEmbed) {
                    return (
                      <iframe
                        key={activeReel.id}
                        src={ytEmbed}
                        title={activeReel.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    );
                  }
                  return (
                    <>
                      <video
                        key={activeReel.id}
                        ref={videoRef}
                        src={activeReel.videoUrl}
                        poster={activeReel.thumbnailUrl || undefined}
                        autoPlay
                        loop
                        muted={muted}
                        playsInline
                        onClick={handleTogglePlay}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                      {paused && (
                        <button
                          type="button"
                          onClick={handleTogglePlay}
                          className="absolute inset-0 flex items-center justify-center bg-black/30"
                          aria-label="Play video"
                        >
                          <div className="w-14 h-14 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white">
                            <Play className="w-6 h-6 ml-0.5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTogglePlay}
                          className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10"
                          aria-label={paused ? 'Play' : 'Pause'}
                        >
                          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMuted((prev) => !prev)}
                          className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10"
                          aria-label={muted ? 'Unmute' : 'Mute'}
                        >
                          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </>
                  );
                })()}

                {/* Bottom Overlay Scrim & Info */}
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none">
                  <div className="space-y-2 pointer-events-auto pr-12">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        src={activeReel.authorAvatar}
                        name={activeReel.authorName}
                        sizeClass="w-8 h-8 text-xs"
                        className="rounded-xl ring-1 ring-white/20"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {activeReel.authorName}
                        </p>
                        <p className="text-[11px] text-zinc-300">
                          {activeReel.category} · {activeReel.viewsCount || 0} views
                        </p>
                      </div>
                    </div>
                    <h2 className="text-sm font-extrabold text-white leading-snug">
                      {activeReel.title}
                    </h2>
                    {activeReel.caption && (
                      <p className="text-xs text-zinc-300 line-clamp-2">{activeReel.caption}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Vertical Rail Controls */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeIndex === 0}
                  className="p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white disabled:opacity-30 transition"
                  aria-label="Previous reel"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLike(activeReel)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition ${
                    likedReelIds.has(activeReel.id)
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-zinc-200'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${likedReelIds.has(activeReel.id) ? 'fill-current' : ''}`}
                  />
                  <span className="text-[11px] font-mono tabular-nums">
                    {activeReel.likesCount || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCommentsOpen((prev) => !prev)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition ${
                    commentsOpen
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-zinc-200'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-[11px] font-mono tabular-nums">
                    {activeReel.commentsCount || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(activeReel)}
                  className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 transition"
                  title="Copy reel link"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {user && activeReel.authorId !== user.uid && (
                  <button
                    type="button"
                    onClick={() =>
                      onStartDMWithUser({
                        uid: activeReel.authorId,
                        displayName: activeReel.authorName,
                        photoURL: activeReel.authorAvatar,
                      })
                    }
                    className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-cyan-300 transition"
                    title={`Message ${activeReel.authorName}`}
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                )}

                {onOpenReport && user && activeReel.authorId !== user.uid && (
                  <button
                    type="button"
                    onClick={() => onOpenReport(activeReel.id, activeReel.title, 'reel')}
                    className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-amber-300 transition"
                    title="Report reel"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                )}

                {(isAdmin || (user && activeReel.authorId === user.uid)) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteReel(activeReel.id)}
                    className={`p-3 rounded-2xl border transition ${
                      confirmDeleteId === activeReel.id
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-white/[0.04] hover:bg-rose-500/15 border-white/10 text-zinc-400 hover:text-rose-400'
                    }`}
                    title={confirmDeleteId === activeReel.id ? 'Click again to confirm delete' : 'Delete reel'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => Math.min(filteredReels.length - 1, prev + 1))
                  }
                  disabled={activeIndex >= filteredReels.length - 1}
                  className="p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white disabled:opacity-30 transition"
                  aria-label="Next reel"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Right Column: Live Comments Drawer OR Reel Playlist */}
          <div className="lg:col-span-5 xl:col-span-6 space-y-5">
            {commentsOpen && activeReel ? (
              <div className="rounded-3xl border border-white/10 bg-[#0b0c14] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Comments ({comments.length})
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate max-w-xs">
                      {activeReel.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCommentsOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-8">
                      No comments on this reel yet.
                    </p>
                  ) : (
                    comments.map((cmt) => {
                      const canDel = isAdmin || (user && cmt.authorId === user.uid);
                      return (
                        <div
                          key={cmt.id}
                          className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5"
                        >
                          <UserAvatar
                            src={cmt.authorAvatar}
                            name={cmt.authorName}
                            sizeClass="w-7 h-7 text-[10px]"
                            className="rounded-lg shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white">
                                {cmt.authorName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {new Date(cmt.createdAt).toLocaleDateString()}
                                </span>
                                {canDel && (
                                  <button
                                    type="button"
                                    onClick={() => deleteReelComment(activeReel.id, cmt.id)}
                                    className="text-zinc-500 hover:text-rose-400"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-zinc-300 mt-1 break-words">{cmt.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handlePostComment} className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={user ? 'Add a comment...' : 'Sign in to comment...'}
                    maxLength={500}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : null}

            {/* Reels Queue Grid */}
            <div className="rounded-3xl border border-white/10 bg-[#0b0c14] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Reel Queue ({filteredReels.length})
                </h3>
                <span className="text-[11px] font-mono text-zinc-500">
                  ↑ / ↓ keys supported
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredReels.map((reel, idx) => {
                  const selected = idx === activeIndex;
                  return (
                    <button
                      key={reel.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                        selected
                          ? 'bg-white/[0.08] border-cyan-400/50'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-[11px] font-mono text-cyan-400">{reel.category}</p>
                        <p className="text-xs font-bold text-white line-clamp-1">{reel.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate">By {reel.authorName}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {reel.viewsCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {reel.likesCount || 0}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Reel Modal */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0c14] text-zinc-200 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Publish New Reel</h3>
                <p className="text-[11px] text-zinc-400">
                  Upload a vertical clip or link a YouTube Short / MP4 video
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReel} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Custom HUD Render Clip"
                    maxLength={120}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Showcase" className="bg-zinc-900">Showcase</option>
                    <option value="Minecraft" className="bg-zinc-900">Minecraft</option>
                    <option value="Android" className="bg-zinc-900">Android</option>
                    <option value="Devlog" className="bg-zinc-900">Devlog</option>
                    <option value="Tutorial" className="bg-zinc-900">Tutorial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Video URL (MP4 / WebM or YouTube Shorts link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/... or https://.../clip.mp4"
                    maxLength={1500}
                    required
                    className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{uploadingVideo ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={handleVideoFileUpload}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cover Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://... (optional poster image)"
                  maxLength={1500}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Caption (Optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Brief description of what is shown in this clip..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReel || uploadingVideo}
                  className="px-5 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition disabled:opacity-50"
                >
                  {submittingReel ? 'Publishing...' : 'Publish Reel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
