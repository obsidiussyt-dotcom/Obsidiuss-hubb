import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Star,
  HardDrive,
  Bookmark,
  Share2,
  Flag,
  Sparkles,
  Calendar,
  User as UserIcon,
  Send,
  Layers,
  Trash2,
  Shield,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Resource, ResourceRating } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { UserAvatar } from './UserAvatar';
import type { NavigateOptions } from '../App';
import { buildHref } from '../App';

interface DownloadModalProps {
  resource: Resource | null;
  onClose: () => void;
  onOpenReport: (
    targetId: string,
    title: string,
    type?: 'resource' | 'discussion' | 'comment' | 'review'
  ) => void;
  openAuth?: () => void;
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  resource,
  onClose,
  onOpenReport,
  openAuth,
  onNavigate,
}) => {
  const { profile, user, isAdmin, toggleBookmark, recordDownload } = useAuth();
  const { resources, incrementDownload, getResourceRatings, rateResource, deleteResourceRating } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'changelog' | 'install' | 'reviews'>('overview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [ratings, setRatings] = useState<ResourceRating[]>([]);
  const [userStars, setUserStars] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState<string | null>(null);
  const [deletingReview, setDeletingReview] = useState(false);

  // Sync live resource data so downloadsCount and rating update immediately
  const liveResource = resource
    ? resources.find((r) => r.id === resource.id) || resource
    : null;

  useEffect(() => {
    if (!liveResource) {
      setRatings([]);
      setUserStars(5);
      setReviewText('');
      setConfirmDeleteReviewId(null);
      return;
    }
    setUserStars(5);
    setReviewText('');
    setConfirmDeleteReviewId(null);
    const unsub = getResourceRatings(liveResource.id, (list) => {
      setRatings(list);
      if (user) {
        const mine = list.find((r) => r.userId === user.uid);
        if (mine) {
          setUserStars(mine.stars);
          setReviewText(mine.review || '');
        }
      }
    });
    return () => unsub();
  }, [liveResource?.id, getResourceRatings, user]);

  if (!liveResource) return null;

  const isBookmarked = profile?.bookmarks?.includes(liveResource.id);

  const handleDownload = async (isMirror = false) => {
    setIsDownloading(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8b5cf6', '#6366f1', '#06b6d4', '#ffffff'],
      });

      await incrementDownload(liveResource.id);
      await recordDownload(liveResource.id, {
        title: liveResource.title,
        version: liveResource.version,
        category: liveResource.category,
      });

      showToast(`Downloading ${liveResource.title} (${liveResource.version})!`, 'success');

      const targetUrl =
        isMirror && liveResource.mirrorUrl ? liveResource.mirrorUrl : liveResource.downloadUrl;
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      showToast('Could not track download, opening file link directly.', 'info');
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${buildHref('resources', { resourceId: liveResource.id })}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast('Direct resource link copied to clipboard!', 'success');
    }
  };

  const handleBookmarkClick = async () => {
    if (!profile) {
      showToast('Sign in with Google to bookmark resources.', 'info');
      openAuth?.();
      return;
    }
    const added = await toggleBookmark(liveResource.id);
    showToast(added ? 'Saved to your bookmarks!' : 'Removed from bookmarks', 'info');
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      openAuth?.();
      return;
    }
    setSubmittingRating(true);
    try {
      await rateResource(liveResource.id, userStars, reviewText);
      showToast('Your rating & review have been saved!', 'success');
    } catch {
      showToast('Failed to save rating. Please try again.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDeleteReview = async (ratingUserId: string) => {
    setDeletingReview(true);
    try {
      await deleteResourceRating(liveResource.id, ratingUserId);
      if (user && ratingUserId === user.uid) {
        setUserStars(5);
        setReviewText('');
      }
      setConfirmDeleteReviewId(null);
      showToast(
        isAdmin && user?.uid !== ratingUserId
          ? 'Review removed by administrator.'
          : 'Your review has been deleted.',
        'info'
      );
    } catch {
      showToast('Could not delete review.', 'error');
    } finally {
      setDeletingReview(false);
    }
  };

  const myExistingReview = user ? ratings.find((r) => r.userId === user.uid) : undefined;
  const avgStars =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
      : liveResource.rating || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-white/10 shadow-2xl bg-[#0c0d15] text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner & Close */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-t-3xl bg-zinc-900">
          {liveResource.thumbnailUrl ? (
            <img
              src={liveResource.thumbnailUrl}
              alt={liveResource.title}
              className="w-full h-full object-cover opacity-65 filter brightness-90 contrast-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-950/60 via-[#0d0e17] to-indigo-950/60 flex items-center justify-center">
              <Layers className="w-16 h-16 text-purple-500/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d15] via-[#0c0d15]/50 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate?.('resources', { category: liveResource.category });
                  }}
                  className="font-bold uppercase tracking-wider text-purple-300 hover:text-purple-200 transition"
                  title={`Browse all ${liveResource.category} resources`}
                >
                  {liveResource.category}
                </button>
                <span className="text-zinc-600">·</span>
                <span className="font-semibold text-zinc-200">
                  {liveResource.version}
                </span>
                {liveResource.featured && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Featured
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {liveResource.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white/[0.01]">
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Download className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-zinc-200 font-mono">
                {(liveResource.downloadsCount || 0).toLocaleString()}
              </span>
              <span>downloads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-zinc-200 font-mono">{liveResource.fileSize}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-white font-mono">
                {liveResource.ratingCount && liveResource.ratingCount > 0
                  ? `${liveResource.rating.toFixed(1)} (${liveResource.ratingCount})`
                  : 'Unrated'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkClick}
              className={`p-2.5 rounded-xl border transition ${
                isBookmarked
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Share resource"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenReport(liveResource.id, liveResource.title)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Report issue"
            >
              <Flag className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDownload(false)}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition active:scale-95 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Starting...' : 'Direct Download'}</span>
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            {(['overview', 'changelog', 'install', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'changelog' && 'Changelog'}
                {tab === 'install' && 'Requirements & Setup'}
                {tab === 'reviews' && `Ratings (${ratings.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Description
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {liveResource.description}
                </p>
              </div>

              {liveResource.tags?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Tags & Compatibility
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {liveResource.tags.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          onClose();
                          onNavigate?.('resources', { search: tag });
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] hover:bg-purple-500/20 text-zinc-300 hover:text-purple-200 border border-white/5 hover:border-purple-500/30 transition"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Release Publisher & Date */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-purple-400" />
                  <span>
                    Published by <strong className="text-white">{liveResource.authorName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>
                    Released {new Date(liveResource.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {liveResource.mirrorUrl && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-white">Alternative Mirror Download</p>
                    <p className="text-[11px] text-zinc-400">
                      Backup download link provided by the creator.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition shrink-0"
                  >
                    <span>Mirror Link</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Version History & Release Notes
                </h4>
                <span className="text-xs text-purple-400 font-mono font-semibold">
                  {liveResource.version}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                {liveResource.changelog || 'No changelog notes added for this release yet.'}
              </div>
            </div>
          )}

          {activeTab === 'install' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Requirements & Installation Notes
              </h4>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-zinc-300 space-y-3 leading-relaxed">
                <p>
                  <strong>System Requirements:</strong>{' '}
                  {liveResource.requirements || 'No specific system requirements specified.'}
                </p>
                <p>
                  <strong>Need Help?</strong> Ask a question in{' '}
                  <a
                    href="/community"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      onNavigate?.('community');
                    }}
                    className="text-purple-400 hover:text-purple-300 underline font-semibold"
                  >
                    Community Discussions
                  </a>{' '}
                  or reach out via{' '}
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      onNavigate?.('contact');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
                  >
                    Contact & Feedback
                  </a>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Rating Summary & Breakdown */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-4 text-center sm:text-left sm:border-r border-white/5 sm:pr-4">
                  <div className="text-4xl font-black text-white font-mono tabular-nums">
                    {ratings.length > 0 ? avgStars.toFixed(1) : '—'}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 my-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(avgStars) ? 'fill-current' : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                <div className="sm:col-span-8 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((starVal) => {
                    const count = ratings.filter((r) => Math.round(r.stars) === starVal).length;
                    const pct = ratings.length > 0 ? Math.round((count / ratings.length) * 100) : 0;
                    return (
                      <div key={starVal} className="flex items-center gap-2.5 text-[11px] font-mono">
                        <span className="w-8 text-zinc-400 flex items-center gap-0.5 shrink-0">
                          {starVal}
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-zinc-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rate & Review Form */}
              <form
                onSubmit={handleRateSubmit}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span>{myExistingReview ? 'Update Your Review' : 'Rate & Review This Resource'}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserStars(star)}
                          className="p-1 focus:outline-none transition hover:scale-110"
                          title={`${star} ${star === 1 ? 'Star' : 'Stars'}`}
                        >
                          <Star
                            className={`w-4 h-4 transition ${
                              star <= userStars
                                ? 'text-amber-400 fill-current'
                                : 'text-zinc-600 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-amber-300 font-semibold ml-1">
                      {userStars}/5
                    </span>
                  </div>
                </div>

                <div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder={
                      profile
                        ? 'Share your experience, performance notes, or feedback (optional)...'
                        : 'Sign in with Google to leave a rating and review.'
                    }
                    disabled={!profile}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none disabled:opacity-60"
                  />
                  {profile && (
                    <div className="flex justify-end text-[10px] font-mono text-zinc-500 mt-1">
                      {reviewText.length}/500
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {myExistingReview ? (
                    <button
                      type="button"
                      disabled={deletingReview}
                      onClick={() => handleDeleteReview(myExistingReview.userId)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete My Review</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  {profile ? (
                    <button
                      type="submit"
                      disabled={submittingRating}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {submittingRating
                          ? 'Saving...'
                          : myExistingReview
                          ? 'Update Review'
                          : 'Submit Review'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openAuth?.();
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
                    >
                      Sign In to Rate
                    </button>
                  )}
                </div>
              </form>

              {/* Ratings List */}
              {ratings.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">
                  No community reviews yet. Be the first to rate this resource!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {ratings.map((rat) => {
                    const isOwner = Boolean(user && user.uid === rat.userId);
                    const canDelete = isAdmin || isOwner;
                    const isEdited = Boolean(rat.updatedAt && rat.updatedAt !== rat.createdAt);

                    return (
                      <div
                        key={rat.id}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar
                              src={rat.userAvatar}
                              name={rat.userName}
                              sizeClass="w-8 h-8 text-xs"
                              className="rounded-xl ring-1 ring-white/10"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white">
                                  {rat.userName}
                                </span>
                                {isOwner && (
                                  <span className="text-[10px] font-mono text-purple-300">
                                    (You)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                                <span>{new Date(rat.createdAt).toLocaleDateString()}</span>
                                {isEdited && <span>· edited</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= rat.stars ? 'fill-current' : 'text-zinc-700'
                                  }`}
                                />
                              ))}
                            </div>

                            {!isOwner && (
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenReport(
                                    `${liveResource.id}:${rat.userId}`,
                                    `Review by ${rat.userName} on ${liveResource.title}`,
                                    'review'
                                  )
                                }
                                className="p-1 text-zinc-500 hover:text-rose-400 transition"
                                title="Report review"
                              >
                                <Flag className="w-3 h-3" />
                              </button>
                            )}

                            {canDelete && (
                              confirmDeleteReviewId === rat.userId ? (
                                <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 rounded-lg px-2 py-0.5">
                                  <button
                                    type="button"
                                    disabled={deletingReview}
                                    onClick={() => handleDeleteReview(rat.userId)}
                                    className="text-[10px] font-bold text-rose-300 hover:text-white"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteReviewId(null)}
                                    className="text-[10px] text-zinc-400 hover:text-white ml-1"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteReviewId(rat.userId)}
                                  className="p-1 text-zinc-500 hover:text-rose-400 transition"
                                  title={
                                    isAdmin && !isOwner
                                      ? 'Moderate: Delete review'
                                      : 'Delete your review'
                                  }
                                >
                                  {isAdmin && !isOwner ? (
                                    <Shield className="w-3.5 h-3.5 text-amber-400 hover:text-rose-400" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {rat.review && (
                          <p className="text-xs text-zinc-300 leading-relaxed pl-10 whitespace-pre-line">
                            {rat.review}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
