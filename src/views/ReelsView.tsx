import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Bookmark,
  Grid,
  Smartphone,
  Disc3,
  AlertCircle,
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
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [heartBurst, setHeartBurst] = useState<{ id: number; x: number; y: number } | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [savedReelIds, setSavedReelIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('obsidiuss_saved_reels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
  const touchStartYRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  const categories = ['All', 'Saved', 'Showcase', 'Minecraft', 'Android', 'Devlog', 'Tutorial'];

  useEffect(() => {
    try {
      localStorage.setItem('obsidiuss_saved_reels', JSON.stringify(savedReelIds));
    } catch {
      // ignore storage quota errors
    }
  }, [savedReelIds]);

  const filteredReels = useMemo(() => {
    if (categoryFilter === 'All') return reels;
    if (categoryFilter === 'Saved') return reels.filter((r) => savedReelIds.includes(r.id));
    return reels.filter((r) => r.category.toLowerCase() === categoryFilter.toLowerCase());
  }, [reels, categoryFilter, savedReelIds]);

  // Jump to deep-linked ?reel=<id>
  useEffect(() => {
    if (initialReelId && filteredReels.length > 0) {
      const idx = filteredReels.findIndex((r) => r.id === initialReelId);
      if (idx >= 0) {
        setActiveIndex(idx);
        setViewMode('feed');
      }
    }
  }, [initialReelId, filteredReels]);

  useEffect(() => {
    if (activeIndex >= filteredReels.length && filteredReels.length > 0) {
      setActiveIndex(0);
    }
  }, [filteredReels.length, activeIndex]);

  const activeReel = filteredReels[activeIndex] || null;

  // Reset per-reel transient state and record view
  useEffect(() => {
    if (!activeReel) return;
    setPaused(false);
    setVideoProgress(0);
    setVideoError(false);
    setCaptionExpanded(false);
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
      if (isCreateOpen || viewMode !== 'feed') return;
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
  }, [filteredReels.length, isCreateOpen, viewMode]);

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

  const triggerHeartBurst = (clientX: number, clientY: number, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    setHeartBurst({
      id: Date.now(),
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    setTimeout(() => setHeartBurst(null), 850);
  };

  const handleVideoSurfaceInteraction = async (
    e: React.MouseEvent<HTMLDivElement>,
    reel: Reel
  ) => {
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 280;
    lastTapRef.current = now;

    if (isDoubleTap) {
      triggerHeartBurst(e.clientX, e.clientY, e.currentTarget);
      if (!likedReelIds.has(reel.id)) {
        await handleLike(reel);
      }
    } else {
      handleTogglePlay();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const deltaY = touchStartYRef.current - endY;
    touchStartYRef.current = null;

    if (deltaY > 55 && activeIndex < filteredReels.length - 1) {
      setActiveIndex((prev) => prev + 1);
    } else if (deltaY < -55 && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
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

  const handleToggleSaveReel = (reelId: string) => {
    if (!user) {
      showToast('Sign in to save reels to your collection.', 'info');
      openAuth();
      return;
    }
    const exists = savedReelIds.includes(reelId);
    setSavedReelIds((prev) => (exists ? prev.filter((id) => id !== reelId) : [reelId, ...prev]));
    showToast(exists ? 'Removed from Saved Reels.' : 'Saved to your Reels collection!', 'success');
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
      setViewMode('feed');
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

  const isSaved = activeReel ? savedReelIds.includes(activeReel.id) : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 animate-fade-up">
      {/* Top Instagram-Style Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 via-pink-500 to-blue-600 bg-clip-text text-transparent">
            Vertical Reels Studio
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            OBSIDIUSS Reels
          </h1>
          <p className="text-xs text-slate-500">
            Double-tap to heart, swipe up/down on mobile, or switch to Explore Grid.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Feed / Explore Grid Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode('feed')}
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'feed'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Feed</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Explore</span>
            </button>
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
            className="min-h-[42px] inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-pink-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:opacity-95 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reel</span>
          </button>
        </div>
      </div>

      {/* Instagram-Style Stories / Quick Reel Highlights Strip */}
      {reels.length > 0 && (
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 no-scrollbar">
          {reels.slice(0, 12).map((reel) => {
            const isSelected = activeReel?.id === reel.id && viewMode === 'feed';
            return (
              <button
                key={reel.id}
                type="button"
                onClick={() => {
                  setCategoryFilter('All');
                  const targetIdx = reels.findIndex((r) => r.id === reel.id);
                  setActiveIndex(targetIdx >= 0 ? targetIdx : 0);
                  setViewMode('feed');
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 group w-[72px]"
              >
                <div
                  className={`p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105 ${
                    isSelected ? 'ig-ring shadow-md shadow-pink-500/25' : 'ig-ring opacity-85'
                  }`}
                >
                  <div className="p-[2px] bg-white rounded-full">
                    <UserAvatar
                      src={reel.thumbnailUrl || reel.authorAvatar}
                      name={reel.authorName}
                      sizeClass="w-13 h-13 text-xs"
                      className="rounded-full"
                    />
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold truncate w-full text-center ${
                    isSelected ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-950'
                  }`}
                >
                  {reel.authorName}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Category & Saved Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoryFilter(cat);
                setActiveIndex(0);
              }}
              className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                active
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200/80 hover:border-blue-200'
              }`}
            >
              {cat}
              {cat === 'Saved' && savedReelIds.length > 0 ? ` (${savedReelIds.length})` : ''}
            </button>
          );
        })}
      </div>

      {/* Stage / Explore Grid / Empty State */}
      {filteredReels.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 via-pink-100 to-blue-100 flex items-center justify-center mx-auto">
            <Film className="w-8 h-8 text-pink-600" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-slate-950">
              {categoryFilter === 'Saved' ? 'No saved reels yet' : 'No reels published yet'}
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {categoryFilter === 'Saved'
                ? 'Tap the bookmark icon on any reel to save it to your collection.'
                : 'Post the first vertical video reel by uploading an MP4 clip or linking a YouTube Short.'}
            </p>
          </div>
          {categoryFilter !== 'Saved' && (
            <button
              type="button"
              onClick={() => (user ? setIsCreateOpen(true) : openAuth())}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-pink-500 to-orange-500 text-white text-xs font-bold shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Publish First Reel</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Instagram Explore 9:16 Grid Mode */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredReels.map((reel, idx) => (
            <button
              key={reel.id}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                setViewMode('feed');
              }}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left"
            >
              {reel.thumbnailUrl ? (
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-900 to-pink-900 flex flex-col items-center justify-center p-4 text-center gap-2">
                  <Film className="w-8 h-8 text-white/70" />
                  <span className="text-xs font-bold text-white/90 line-clamp-2">{reel.title}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-300">
                  {reel.category}
                </p>
                <p className="text-xs font-bold text-white line-clamp-1">{reel.title}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-200">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-400 fill-current" />
                    {reel.likesCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-sky-400" />
                    {reel.viewsCount || 0}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Instagram Reels Player + Side Queue / Comments */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {activeReel && (
            <div className="lg:col-span-7 xl:col-span-6 flex items-center justify-center gap-3">
              {/* Previous / Next Desktop Stepper */}
              <div className="hidden sm:flex flex-col items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeIndex === 0}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 shadow-sm disabled:opacity-30 transition"
                  aria-label="Previous reel"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {activeIndex + 1}/{filteredReels.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => Math.min(filteredReels.length - 1, prev + 1))
                  }
                  disabled={activeIndex >= filteredReels.length - 1}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 shadow-sm disabled:opacity-30 transition"
                  aria-label="Next reel"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* 9:16 Instagram Video Card */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative w-full max-w-[355px] sm:max-w-[395px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-slate-200/90 bg-slate-950 shadow-2xl shadow-blue-950/20 select-none"
              >
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
                  if (videoError) {
                    return (
                      <div className="w-full h-full bg-gradient-to-br from-blue-950 via-slate-900 to-pink-950 flex flex-col items-center justify-center p-6 text-center gap-3">
                        <AlertCircle className="w-10 h-10 text-orange-400" />
                        <p className="text-sm font-bold text-white">{activeReel.title}</p>
                        <p className="text-xs text-slate-300">
                          This video stream could not be loaded directly in-browser.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div
                      onClick={(e) => handleVideoSurfaceInteraction(e, activeReel)}
                      className="relative w-full h-full cursor-pointer"
                    >
                      <video
                        key={activeReel.id}
                        ref={videoRef}
                        src={activeReel.videoUrl}
                        poster={activeReel.thumbnailUrl || undefined}
                        autoPlay
                        loop
                        muted={muted}
                        playsInline
                        onError={() => setVideoError(true)}
                        onTimeUpdate={() => {
                          if (!videoRef.current || !videoRef.current.duration) return;
                          setVideoProgress(
                            (videoRef.current.currentTime / videoRef.current.duration) * 100
                          );
                        }}
                        className="w-full h-full object-cover"
                      />

                      {/* Double-Tap Animated Heart Burst */}
                      {heartBurst && (
                        <div
                          key={heartBurst.id}
                          style={{ left: heartBurst.x - 42, top: heartBurst.y - 42 }}
                          className="animate-heart-burst absolute pointer-events-none z-20"
                        >
                          <Heart className="w-20 h-20 text-pink-500 fill-pink-500 drop-shadow-[0_6px_22px_rgba(236,72,153,0.65)]" />
                        </div>
                      )}

                      {paused && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
                          <div className="w-16 h-16 rounded-full bg-black/65 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-xl">
                            <Play className="w-7 h-7 ml-0.5 fill-current" />
                          </div>
                        </div>
                      )}

                      {/* Top Controls */}
                      <div
                        className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-[11px] font-bold text-white border border-white/15">
                          Reels · {activeReel.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleTogglePlay}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white border border-white/15 backdrop-blur-md transition"
                            aria-label={paused ? 'Play' : 'Pause'}
                          >
                            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setMuted((prev) => !prev)}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white border border-white/15 backdrop-blur-md transition"
                            aria-label={muted ? 'Unmute' : 'Mute'}
                          >
                            {muted ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Instagram-Style Right Overlay Action Column */}
                <div className="absolute right-2.5 bottom-4 z-20 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleLike(activeReel)}
                    className="flex flex-col items-center gap-0.5 text-white drop-shadow transition active:scale-125"
                    aria-label="Like reel"
                  >
                    <div
                      className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border ${
                        likedReelIds.has(activeReel.id)
                          ? 'bg-pink-500/30 border-pink-400 text-pink-400'
                          : 'bg-black/45 border-white/15 text-white hover:bg-black/65'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          likedReelIds.has(activeReel.id) ? 'fill-current' : ''
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-bold font-mono tabular-nums">
                      {activeReel.likesCount || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCommentsOpen((prev) => !prev)}
                    className="flex flex-col items-center gap-0.5 text-white drop-shadow transition active:scale-110"
                    aria-label="Comments"
                  >
                    <div
                      className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border ${
                        commentsOpen
                          ? 'bg-blue-600/80 border-blue-400 text-white'
                          : 'bg-black/45 border-white/15 text-white hover:bg-black/65'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold font-mono tabular-nums">
                      {activeReel.commentsCount || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSaveReel(activeReel.id)}
                    className="flex flex-col items-center gap-0.5 text-white drop-shadow transition active:scale-110"
                    aria-label="Save reel"
                    title={isSaved ? 'Remove bookmark' : 'Save reel'}
                  >
                    <div
                      className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border ${
                        isSaved
                          ? 'bg-orange-500/80 border-orange-300 text-white'
                          : 'bg-black/45 border-white/15 text-white hover:bg-black/65'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(activeReel)}
                    className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 border border-white/15 backdrop-blur-md flex items-center justify-center text-white transition active:scale-110"
                    title="Copy reel link"
                    aria-label="Share reel"
                  >
                    <Share2 className="w-4 h-4" />
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
                      className="w-10 h-10 rounded-full bg-black/45 hover:bg-blue-600 border border-white/15 backdrop-blur-md flex items-center justify-center text-white transition"
                      title={`Message ${activeReel.authorName}`}
                      aria-label={`Message ${activeReel.authorName}`}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  )}

                  {onOpenReport && user && activeReel.authorId !== user.uid && (
                    <button
                      type="button"
                      onClick={() => onOpenReport(activeReel.id, activeReel.title, 'reel')}
                      className="w-9 h-9 rounded-full bg-black/45 hover:bg-orange-600 border border-white/15 backdrop-blur-md flex items-center justify-center text-zinc-200 hover:text-white transition"
                      title="Report reel"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {(isAdmin || (user && activeReel.authorId === user.uid)) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReel(activeReel.id)}
                      className={`w-9 h-9 rounded-full border backdrop-blur-md flex items-center justify-center transition ${
                        confirmDeleteId === activeReel.id
                          ? 'bg-pink-600 border-pink-400 text-white'
                          : 'bg-black/45 hover:bg-pink-600 border-white/15 text-zinc-200 hover:text-white'
                      }`}
                      title={
                        confirmDeleteId === activeReel.id
                          ? 'Tap again to confirm delete'
                          : 'Delete reel'
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Spinning Audio/Creator Disc */}
                  <div className="p-0.5 rounded-full ig-ring shadow-md mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white animate-vinyl-spin">
                      <Disc3 className="w-4 h-4 text-sky-300" />
                    </div>
                  </div>
                </div>

                {/* Bottom Overlay Scrim, Creator Info & Expandable Caption */}
                <div className="absolute inset-x-0 bottom-0 p-4 pr-16 bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none z-10">
                  <div className="space-y-2 pointer-events-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="p-[2px] rounded-full ig-ring shrink-0">
                        <div className="p-[1px] bg-black rounded-full">
                          <UserAvatar
                            src={activeReel.authorAvatar}
                            name={activeReel.authorName}
                            sizeClass="w-8 h-8 text-xs"
                            className="rounded-full"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">
                            {activeReel.authorName}
                          </p>
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
                              className="px-2 py-0.5 rounded-md border border-white/35 bg-white/10 hover:bg-white/25 text-[10px] font-bold text-white transition"
                            >
                              Message
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-300">
                          {activeReel.viewsCount || 0} views
                        </p>
                      </div>
                    </div>

                    <h2 className="text-sm font-extrabold text-white leading-snug">
                      {activeReel.title}
                    </h2>

                    {activeReel.caption && (
                      <button
                        type="button"
                        onClick={() => setCaptionExpanded((p) => !p)}
                        className="text-left block w-full"
                      >
                        <p
                          className={`text-xs text-zinc-200 ${
                            captionExpanded ? '' : 'line-clamp-2'
                          }`}
                        >
                          {activeReel.caption}
                        </p>
                      </button>
                    )}

                    {/* Audio / Source Ticker Line */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-200/90 pt-0.5">
                      <Disc3 className="w-3.5 h-3.5 text-orange-300 shrink-0" />
                      <span className="truncate">
                        Original audio · {activeReel.authorName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Video Progress Bar */}
                {videoProgress > 0 && (
                  <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20 z-30">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-pink-500 to-orange-500 transition-[width] duration-150"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Previous / Next Strip */}
          {filteredReels.length > 1 && (
            <div className="flex sm:hidden items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeIndex === 0}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 disabled:opacity-35 shadow-xs"
              >
                Previous
              </button>
              <span className="text-xs font-mono font-bold text-slate-500">
                {activeIndex + 1} / {filteredReels.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => Math.min(filteredReels.length - 1, prev + 1))
                }
                disabled={activeIndex >= filteredReels.length - 1}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 disabled:opacity-35 shadow-xs"
              >
                Next
              </button>
            </div>
          )}

          {/* Right Column: Live Comments Drawer + Up Next Queue */}
          <div className="lg:col-span-5 xl:col-span-6 space-y-5">
            {commentsOpen && activeReel && (
              <div className="animate-modal-pop rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-lg shadow-blue-950/[0.06]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-950">
                      Comments ({comments.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">
                      {activeReel.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCommentsOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
                    aria-label="Close comments"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">
                      No comments yet. Start the conversation!
                    </p>
                  ) : (
                    comments.map((cmt) => {
                      const canDel = isAdmin || (user && cmt.authorId === user.uid);
                      return (
                        <div
                          key={cmt.id}
                          className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                        >
                          <UserAvatar
                            src={cmt.authorAvatar}
                            name={cmt.authorName}
                            sizeClass="w-8 h-8 text-[10px]"
                            className="rounded-full shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {cmt.authorName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-400">
                                  {new Date(cmt.createdAt).toLocaleDateString()}
                                </span>
                                {canDel && (
                                  <button
                                    type="button"
                                    onClick={() => deleteReelComment(activeReel.id, cmt.id)}
                                    className="text-slate-400 hover:text-pink-600"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 mt-1 break-words">{cmt.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={handlePostComment}
                  className="flex items-center gap-2 pt-2 border-t border-slate-100"
                >
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={user ? 'Add a comment...' : 'Sign in to comment...'}
                    maxLength={500}
                    className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Up Next / Reels Queue */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-950">
                  Up Next ({filteredReels.length})
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Swipe or ↑ / ↓ keys
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
                          ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                          : 'bg-slate-50/70 hover:bg-white border-slate-200/70 hover:border-blue-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-pink-600">{reel.category}</p>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">
                          {reel.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          By {reel.authorName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-blue-600" /> {reel.viewsCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-500" /> {reel.likesCount || 0}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-md"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="animate-modal-pop w-full max-w-lg rounded-3xl border border-slate-200 bg-white text-slate-900 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-pink-500 to-blue-600" />
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-950">
                  Publish New Reel
                </h3>
                <p className="text-[11px] text-slate-500">
                  Upload a vertical clip or link a YouTube Short / MP4 video
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReel} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Custom HUD Render Clip"
                    maxLength={120}
                    required
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Showcase">Showcase</option>
                    <option value="Minecraft">Minecraft</option>
                    <option value="Android">Android</option>
                    <option value="Devlog">Devlog</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  <label className="min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 cursor-pointer shrink-0 transition">
                    <Upload className="w-3.5 h-3.5" />
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://... (optional poster image)"
                  maxLength={1500}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Caption (Optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Brief description of what is shown in this clip..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReel || uploadingVideo}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-pink-500 to-orange-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
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
