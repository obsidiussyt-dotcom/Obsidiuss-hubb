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
        colors: ['#2563eb', '#0ea5e9', '#ec4899', '#f97316', '#ffffff'],
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
      showToast('Sign in to bookmark resources.', 'info');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 shadow-2xl bg-white text-slate-800 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner & Close (intentional dark scrim over media for contrast) */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-t-3xl bg-slate-900">
          {liveResource.thumbnailUrl ? (
            <img
              src={liveResource.thumbnailUrl}
              alt={liveResource.title}
              className="w-full h-full object-cover opacity-75"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-700 via-sky-600 to-pink-600 flex items-center justify-center">
              <Layers className="w-16 h-16 text-white/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition"
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
                  className="px-2 py-0.5 rounded-md bg-blue-600/90 text-white font-bold uppercase tracking-wider hover:bg-blue-500 transition"
                  title={`Browse all ${liveResource.category} resources`}
                >
                  {liveResource.category}
                </button>
                <span className="text-white/60">·</span>
                <span className="font-semibold text-white/90">{liveResource.version}</span>
                {liveResource.featured && (
                  <>
                    <span className="text-white/60">·</span>
                    <span className="flex items-center gap-1 font-bold text-orange-300">
                      <Sparkles className="w-3 h-3 text-orange-400" /> Featured
                    </span>
                  </>
                )}
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {liveResource.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-950 font-mono">
                {(liveResource.downloadsCount || 0).toLocaleString()}
              </span>
              <span>downloads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-slate-950 font-mono">{liveResource.fileSize}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-slate-950 font-mono">
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
                  ? 'bg-pink-50 border-pink-300 text-pink-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
              title="Share resource"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenReport(liveResource.id, liveResource.title)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition"
              title="Report issue"
            >
              <Flag className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDownload(false)}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Starting...' : 'Direct Download'}</span>
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
            {(['overview', 'changelog', 'install', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {liveResource.description}
                </p>
              </div>

              {liveResource.tags?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
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
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span>
                    Published by <strong className="text-slate-950">{liveResource.authorName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span>Released {new Date(liveResource.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {liveResource.mirrorUrl && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-950">Alternative Mirror Download</p>
                    <p className="text-[11px] text-slate-600">
                      Backup download link provided by the creator.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 text-xs font-semibold text-blue-700 hover:text-white transition shrink-0"
                  >
                    <span>Mirror Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Version History & Release Notes
                </h4>
                <span className="text-xs text-blue-600 font-mono font-semibold">
                  {liveResource.version}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {liveResource.changelog || 'No changelog notes added for this release yet.'}
              </div>
            </div>
          )}

          {activeTab === 'install' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Requirements & Installation Notes
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
                <p>
                  <strong className="text-slate-950">System Requirements:</strong>{' '}
                  {liveResource.requirements || 'No specific system requirements specified.'}
                </p>
                <p>
                  <strong className="text-slate-950">Need Help?</strong> Ask a question in{' '}
                  <a
                    href="/community"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      onNavigate?.('community');
                    }}
                    className="text-blue-600 hover:text-blue-800 underline font-semibold"
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
                    className="text-pink-600 hover:text-pink-700 underline font-semibold"
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
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-4 text-center sm:text-left sm:border-r border-slate-200 sm:pr-4">
                  <div className="font-display text-4xl font-black text-slate-950 font-mono tabular-nums">
                    {ratings.length > 0 ? avgStars.toFixed(1) : '—'}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-orange-500 my-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(avgStars) ? 'fill-current' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                <div className="sm:col-span-8 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((starVal) => {
                    const count = ratings.filter((r) => Math.round(r.stars) === starVal).length;
                    const pct = ratings.length > 0 ? Math.round((count / ratings.length) * 100) : 0;
                    return (
                      <div key={starVal} className="flex items-center gap-2.5 text-[11px] font-mono">
                        <span className="w-8 text-slate-600 flex items-center gap-0.5 shrink-0">
                          {starVal}
                          <Star className="w-3 h-3 text-orange-500 fill-current" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rate & Review Form */}
              <form
                onSubmit={handleRateSubmit}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
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
                                ? 'text-orange-500 fill-current'
                                : 'text-slate-300 hover:text-orange-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-orange-600 font-semibold ml-1">
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
                        : 'Sign in to leave a rating and review.'
                    }
                    disabled={!profile}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none disabled:opacity-60"
                  />
                  {profile && (
                    <div className="flex justify-end text-[10px] font-mono text-slate-400 mt-1">
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
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition disabled:opacity-50"
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
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
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
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                    >
                      Sign In to Rate
                    </button>
                  )}
                </div>
              </form>

              {/* Ratings List */}
              {ratings.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
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
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar
                              src={rat.userAvatar}
                              name={rat.userName}
                              sizeClass="w-8 h-8 text-xs"
                              className="rounded-xl ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-950">
                                  {rat.userName}
                                </span>
                                {isOwner && (
                                  <span className="text-[10px] font-mono text-blue-600 font-semibold">
                                    (You)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                                <span>{new Date(rat.createdAt).toLocaleDateString()}</span>
                                {isEdited && <span>· edited</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-0.5 text-orange-500">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= rat.stars ? 'fill-current' : 'text-slate-300'
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
                                className="p-1 text-slate-400 hover:text-pink-600 transition"
                                title="Report review"
                              >
                                <Flag className="w-3 h-3" />
                              </button>
                            )}

                            {canDelete && (
                              confirmDeleteReviewId === rat.userId ? (
                                <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5">
                                  <button
                                    type="button"
                                    disabled={deletingReview}
                                    onClick={() => handleDeleteReview(rat.userId)}
                                    className="text-[10px] font-bold text-rose-600 hover:text-rose-800"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteReviewId(null)}
                                    className="text-[10px] text-slate-500 hover:text-slate-900 ml-1"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteReviewId(rat.userId)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                                  title={
                                    isAdmin && !isOwner
                                      ? 'Moderate: Delete review'
                                      : 'Delete your review'
                                  }
                                >
                                  {isAdmin && !isOwner ? (
                                    <Shield className="w-3.5 h-3.5 text-orange-500 hover:text-rose-600" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {rat.review && (
                          <p className="text-xs text-slate-700 leading-relaxed pl-10 whitespace-pre-line">
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
