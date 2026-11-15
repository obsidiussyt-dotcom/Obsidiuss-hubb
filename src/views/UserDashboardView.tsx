import React, { useState, useEffect, useCallback } from 'react';
import {
  User as UserIcon,
  Bookmark,
  Download,
  MessageSquare,
  Edit3,
  Calendar,
  Save,
  Shield,
  Trash2,
  Camera,
  Star,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Resource, Comment, ResourceRating } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import type { NavigateOptions } from '../App';

interface UserDashboardViewProps {
  onSelectResource: (resource: Resource) => void;
  setCurrentTab: (tab: string) => void;
  onNavigate?: (tab: string, options?: NavigateOptions) => void;
  openAuth: () => void;
}

function resizeImageToDataUrl(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        // Center-crop square
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
        let dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (dataUrl.length > 180000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        }
        if (dataUrl.length > 190000) {
          reject(new Error('Image is still too large after compression.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  onSelectResource,
  setCurrentTab,
  onNavigate,
  openAuth,
}) => {
  const { profile, updateProfileData, toggleBookmark, downloadHistory, isAdmin } = useAuth();
  const {
    resources,
    discussions,
    deleteDiscussion,
    deleteComment,
    deleteResourceRating,
    getUserActivityComments,
    getUserActivityReviews,
  } = useData();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [discordHandle, setDiscordHandle] = useState(profile?.discordHandle || '');
  const [youtubeHandle, setYoutubeHandle] = useState(profile?.youtubeHandle || '');
  const [processingAvatar, setProcessingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history' | 'posts' | 'reviews'>('bookmarks');

  const [userComments, setUserComments] = useState<{ comment: Comment; discussionTitle: string }[]>([]);
  const [userReviews, setUserReviews] = useState<(ResourceRating & { resourceTitle: string })[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhotoURL(profile.photoURL || '');
      setBio(profile.bio || '');
      setDiscordHandle(profile.discordHandle || '');
      setYoutubeHandle(profile.youtubeHandle || '');
    }
  }, [profile]);

  const loadUserActivity = useCallback(async () => {
    if (!profile) return;
    setLoadingActivity(true);
    try {
      const [cmts, revs] = await Promise.all([
        getUserActivityComments(profile.uid),
        getUserActivityReviews(profile.uid),
      ]);
      setUserComments(cmts);
      setUserReviews(revs);
    } catch {
      // ignore non-critical
    } finally {
      setLoadingActivity(false);
    }
  }, [profile, getUserActivityComments, getUserActivityReviews]);

  useEffect(() => {
    loadUserActivity();
  }, [loadUserActivity]);

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Sign In to Access Your Profile</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Customize your username, avatar, and bio, and view your bookmarks, download history, comments, and reviews.
        </p>
        <button
          onClick={openAuth}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  const bookmarkedResources = resources.filter((r) => profile.bookmarks?.includes(r.id));
  const userDiscussions = discussions.filter((d) => d.authorId === profile.uid);

  // Merge Firestore persisted downloadActivity with local fallback
  const persistedActivity = profile.downloadActivity || [];
  const persistedIds = new Set(persistedActivity.map((a) => a.resourceId));
  const localOnlyDownloads = resources
    .filter((r) => downloadHistory.includes(r.id) && !persistedIds.has(r.id))
    .map((r) => ({
      resourceId: r.id,
      resourceTitle: r.title,
      resourceVersion: r.version,
      resourceCategory: r.category,
      downloadedAt: '',
    }));
  const combinedDownloadActivity = [...persistedActivity, ...localOnlyDownloads];

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file must be under 8 MB.', 'error');
      return;
    }
    setProcessingAvatar(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 256);
      setPhotoURL(dataUrl);
      showToast('Profile picture ready! Click "Save Profile" to apply.', 'success');
    } catch {
      showToast('Could not process image. Try a smaller PNG or JPG.', 'error');
    } finally {
      setProcessingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = displayName.trim();
    if (!cleanName) {
      showToast('Username cannot be empty.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfileData({
        displayName: cleanName,
        photoURL: photoURL.trim(),
        bio: bio.trim(),
        discordHandle: discordHandle.trim(),
        youtubeHandle: youtubeHandle.trim(),
      });
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch {
      showToast('Could not save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Overview Card */}
      <div className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-8 bg-gradient-to-br from-purple-950/20 via-[#0d0e17] to-zinc-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <UserAvatar
            src={profile.photoURL}
            name={profile.displayName}
            sizeClass="w-20 h-20 text-2xl"
            className="rounded-2xl ring-2 ring-purple-500/50 shadow-xl shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {profile.displayName}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  profile.role === 'Creator'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : profile.role === 'Admin'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : profile.role === 'VIP'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-white/10 text-zinc-300'
                }`}
              >
                {profile.role}
              </span>
            </div>

            <p className="text-xs text-zinc-300 max-w-lg leading-relaxed">
              {profile.bio || 'No bio added yet. Click Edit Profile to introduce yourself.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined{' '}
                {new Date(profile.joinedAt).toLocaleDateString()}
              </span>
              {profile.discordHandle && (
                <span className="text-purple-400">Discord: {profile.discordHandle}</span>
              )}
              {profile.youtubeHandle && (
                <span className="text-red-400">YouTube: {profile.youtubeHandle}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setDisplayName(profile.displayName);
              setPhotoURL(profile.photoURL || '');
              setBio(profile.bio || '');
              setDiscordHandle(profile.discordHandle || '');
              setYoutubeHandle(profile.youtubeHandle || '');
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold transition"
          >
            <Edit3 className="w-4 h-4 text-purple-400" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 sm:p-7 rounded-3xl glass-panel border border-purple-500/30 space-y-5 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-purple-400" />
            <span>Customize Your Profile</span>
          </h3>

          {/* Avatar Upload Section */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <UserAvatar
              src={photoURL}
              name={displayName || profile.displayName}
              sizeClass="w-16 h-16 text-xl"
              className="rounded-2xl ring-2 ring-purple-500/40 shrink-0"
            />
            <div className="flex-1 space-y-2 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{processingAvatar ? 'Processing...' : 'Upload Profile Picture'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleAvatarFileChange}
                    disabled={processingAvatar}
                    className="hidden"
                  />
                </label>
                {photoURL && (
                  <button
                    type="button"
                    onClick={() => setPhotoURL('')}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 text-xs font-semibold transition"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <input
                type="url"
                value={photoURL.startsWith('data:') ? '' : photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder={
                  photoURL.startsWith('data:')
                    ? 'Custom uploaded image selected (or paste an https:// image URL to replace)'
                    : 'Or paste an https:// avatar image URL...'
                }
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Username / Display Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                placeholder="Your community username"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Discord Handle</label>
              <input
                type="text"
                value={discordHandle}
                onChange={(e) => setDiscordHandle(e.target.value)}
                maxLength={80}
                placeholder="@username"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">YouTube Handle</label>
              <input
                type="text"
                value={youtubeHandle}
                onChange={(e) => setYoutubeHandle(e.target.value)}
                maxLength={80}
                placeholder="@channel"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">Short Bio</label>
              <span className="text-[10px] font-mono text-zinc-500">{bio.length}/600</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={600}
              placeholder="Tell the community a bit about yourself, your setup, or projects..."
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || processingAvatar}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Saved Bookmarks
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {profile.bookmarks?.length || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Total Downloads
          </span>
          <div className="text-2xl font-black text-purple-400 font-mono mt-1">
            {profile.downloadsCount || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Topics & Comments
          </span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            {userDiscussions.length + userComments.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Resource Reviews
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {userReviews.length}
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'bookmarks'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarkedResources.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Downloads ({combinedDownloadActivity.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Topics & Comments ({userDiscussions.length + userComments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>My Reviews ({userReviews.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadUserActivity}
            disabled={loadingActivity}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition shrink-0"
            title="Refresh activity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingActivity ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedResources.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/5 space-y-3">
                <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-white">No bookmarked resources</p>
                <p className="text-xs text-zinc-400">
                  Save your favorite tools and downloads to find them quickly here.
                </p>
                <button
                  onClick={() => setCurrentTab('resources')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
                >
                  Browse Resources
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedResources.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectResource(res)}
                    className="group rounded-3xl glass-panel border border-white/10 overflow-hidden hover:border-purple-500/40 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-36 w-full bg-zinc-900 overflow-hidden">
                        {res.thumbnailUrl ? (
                          <img
                            src={res.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-950/60 to-indigo-950/60 flex items-center justify-center">
                            <Download className="w-8 h-8 text-purple-400/40" />
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(res.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-purple-400"
                          title="Remove bookmark"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition truncate">
                          {res.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {res.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectResource(res);
                        }}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-purple-600 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {combinedDownloadActivity.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/5 space-y-3">
                <Download className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-white">No download activity yet</p>
                <p className="text-xs text-zinc-400">
                  Packages you download while signed in will be logged to your account activity.
                </p>
                <button
                  onClick={() => setCurrentTab('resources')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
                >
                  Explore Releases
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {combinedDownloadActivity.map((item) => {
                  const res = resources.find((r) => r.id === item.resourceId);
                  return (
                    <div
                      key={item.resourceId}
                      onClick={() => res && onSelectResource(res)}
                      className={`p-4 rounded-2xl glass-panel border border-white/5 flex items-center justify-between gap-4 ${
                        res ? 'glass-panel-hover cursor-pointer' : 'opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {res?.thumbnailUrl ? (
                          <img
                            src={res.thumbnailUrl}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                            <Download className="w-4 h-4 text-purple-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            {res?.title || item.resourceTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 font-mono">
                            {(res?.version || item.resourceVersion) && (
                              <span>{res?.version || item.resourceVersion}</span>
                            )}
                            {(res?.category || item.resourceCategory) && (
                              <span>· {res?.category || item.resourceCategory}</span>
                            )}
                            {item.downloadedAt && (
                              <span className="flex items-center gap-1 text-zinc-500">
                                · <Clock className="w-3 h-3" />{' '}
                                {new Date(item.downloadedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {res ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectResource(res);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shrink-0"
                        >
                          Open Package
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-mono">Archived</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-8">
            {/* Forum Topics */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Your Forum Topics ({userDiscussions.length})
              </h3>
              {userDiscussions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl glass-panel border border-white/5 space-y-2">
                  <p className="text-xs text-zinc-400">You have not created any forum topics yet.</p>
                  <button
                    onClick={() => setCurrentTab('community')}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
                  >
                    Start a Discussion
                  </button>
                </div>
              ) : (
                userDiscussions.map((disc) => (
                  <div
                    key={disc.id}
                    className="p-4 rounded-2xl glass-panel border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div
                      onClick={() =>
                        onNavigate
                          ? onNavigate('community', { threadId: disc.id })
                          : setCurrentTab('community')
                      }
                      className="cursor-pointer flex-1"
                    >
                      <h4 className="text-xs font-bold text-white hover:text-purple-300 transition">
                        {disc.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {disc.category} · {disc.repliesCount || 0} replies · {disc.likesCount || 0} likes
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await deleteDiscussion(disc.id);
                        showToast('Topic deleted.', 'info');
                      }}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Delete topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Comments History */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Your Discussion Comments ({userComments.length})
              </h3>
              {loadingActivity ? (
                <div className="h-20 rounded-2xl glass-panel animate-pulse bg-white/[0.02]" />
              ) : userComments.length === 0 ? (
                <div className="p-8 text-center rounded-2xl glass-panel border border-white/5 text-xs text-zinc-400">
                  No replies or comments posted in discussions yet.
                </div>
              ) : (
                userComments.map(({ comment, discussionTitle }) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl glass-panel border border-white/5 flex items-start justify-between gap-4"
                  >
                    <div
                      onClick={() =>
                        onNavigate
                          ? onNavigate('community', { threadId: comment.discussionId })
                          : setCurrentTab('community')
                      }
                      className="cursor-pointer flex-1 space-y-1"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-purple-300 font-semibold">
                        <span>Replied in: {discussionTitle}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed">{comment.content}</p>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await deleteComment(comment.discussionId, comment.id);
                        setUserComments((prev) =>
                          prev.filter((item) => item.comment.id !== comment.id)
                        );
                        showToast('Comment deleted.', 'info');
                      }}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition shrink-0"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {loadingActivity ? (
              <div className="h-24 rounded-2xl glass-panel animate-pulse bg-white/[0.02]" />
            ) : userReviews.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel border border-white/5 space-y-3">
                <Star className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-white">No resource reviews yet</p>
                <p className="text-xs text-zinc-400">
                  Open any resource and visit the Ratings tab to submit a star rating and review.
                </p>
                <button
                  onClick={() => setCurrentTab('resources')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition"
                >
                  Browse Resources
                </button>
              </div>
            ) : (
              userReviews.map((rev) => {
                const res = resources.find((r) => r.id === rev.resourceId);
                return (
                  <div
                    key={`${rev.resourceId}-${rev.userId}`}
                    className="p-4 rounded-2xl glass-panel border border-white/5 flex items-start justify-between gap-4"
                  >
                    <div
                      onClick={() => res && onSelectResource(res)}
                      className={`flex-1 space-y-1.5 ${res ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white hover:text-purple-300 transition">
                          {rev.resourceTitle}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.stars ? 'fill-current' : 'text-zinc-700'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {rev.review ? (
                        <p className="text-xs text-zinc-300 leading-relaxed">{rev.review}</p>
                      ) : (
                        <p className="text-[11px] text-zinc-500 italic">Star rating only (no text)</p>
                      )}
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        Submitted {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await deleteResourceRating(rev.resourceId, rev.userId);
                        setUserReviews((prev) =>
                          prev.filter((item) => item.resourceId !== rev.resourceId)
                        );
                        showToast('Review deleted.', 'info');
                      }}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition shrink-0"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
