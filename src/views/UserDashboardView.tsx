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
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-950">Sign In to Access Your Profile</h2>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">
          Customize your username, avatar, and bio, and view your bookmarks, download history, comments, and reviews.
        </p>
        <button
          onClick={openAuth}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  const bookmarkedResources = resources.filter((r) => profile.bookmarks?.includes(r.id));
  const userDiscussions = discussions.filter((d) => d.authorId === profile.uid);

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-up">
      {/* Profile Overview Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 bg-gradient-to-br from-white via-blue-50/40 to-pink-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="ig-ring p-[2.5px] rounded-2xl shrink-0 shadow-md">
            <UserAvatar
              src={profile.photoURL}
              name={profile.displayName}
              sizeClass="w-20 h-20 text-2xl"
              className="rounded-[14px] bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-950">
                {profile.displayName}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  profile.role === 'Creator'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : profile.role === 'Admin'
                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                    : profile.role === 'VIP'
                    ? 'bg-pink-50 text-pink-700 border border-pink-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {profile.role}
              </span>
            </div>

            <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
              {profile.bio || 'No bio added yet. Click Edit Profile to introduce yourself.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Joined{' '}
                {new Date(profile.joinedAt).toLocaleDateString()}
              </span>
              {profile.discordHandle && (
                <span className="text-indigo-600 font-medium">Discord: {profile.discordHandle}</span>
              )}
              {profile.youtubeHandle && (
                <span className="text-red-600 font-medium">YouTube: {profile.youtubeHandle}</span>
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
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm transition"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition"
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
          className="p-6 sm:p-7 rounded-3xl glass-panel border-blue-200 space-y-5 animate-modal-pop"
        >
          <h3 className="font-display text-sm font-bold text-slate-950 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>Customize Your Profile</span>
          </h3>

          {/* Avatar Upload Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <UserAvatar
              src={photoURL}
              name={displayName || profile.displayName}
              sizeClass="w-16 h-16 text-xl"
              className="rounded-2xl ring-2 ring-blue-200 shrink-0"
            />
            <div className="flex-1 space-y-2 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-sm transition">
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
                    className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-semibold transition"
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
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username / Display Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                placeholder="Your community username"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Discord Handle</label>
              <input
                type="text"
                value={discordHandle}
                onChange={(e) => setDiscordHandle(e.target.value)}
                maxLength={80}
                placeholder="@username"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube Handle</label>
              <input
                type="text"
                value={youtubeHandle}
                onChange={(e) => setYoutubeHandle(e.target.value)}
                maxLength={80}
                placeholder="@channel"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Short Bio</label>
              <span className="text-[10px] font-mono text-slate-400">{bio.length}/600</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={600}
              placeholder="Tell the community a bit about yourself, your setup, or projects..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || processingAvatar}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
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
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Saved Bookmarks
          </span>
          <div className="font-display text-2xl font-black text-pink-600 font-mono mt-1">
            {profile.bookmarks?.length || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Downloads
          </span>
          <div className="font-display text-2xl font-black text-blue-600 font-mono mt-1">
            {profile.downloadsCount || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Topics &amp; Comments
          </span>
          <div className="font-display text-2xl font-black text-sky-600 font-mono mt-1">
            {userDiscussions.length + userComments.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Resource Reviews
          </span>
          <div className="font-display text-2xl font-black text-orange-500 font-mono mt-1">
            {userReviews.length}
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'bookmarks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarkedResources.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Downloads ({combinedDownloadActivity.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Topics &amp; Comments ({userDiscussions.length + userComments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
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
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition shrink-0"
            title="Refresh activity"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingActivity ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedResources.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
                <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-950">No bookmarked resources</p>
                <p className="text-xs text-slate-500">
                  Save your favorite tools and downloads to find them quickly here.
                </p>
                <button
                  onClick={() => setCurrentTab('resources')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
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
                    className="group rounded-3xl glass-panel glass-panel-hover overflow-hidden cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                        {res.thumbnailUrl ? (
                          <img
                            src={res.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-pink-500 flex items-center justify-center">
                            <Download className="w-8 h-8 text-white/60" />
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(res.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-pink-600 shadow-sm"
                          title="Remove bookmark"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-slate-950 group-hover:text-blue-600 transition truncate">
                          {res.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
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
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 text-xs font-bold text-slate-800 hover:text-white transition flex items-center justify-center gap-1.5"
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
              <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
                <Download className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-950">No download activity yet</p>
                <p className="text-xs text-slate-500">
                  Packages you download while signed in will be logged to your account activity.
                </p>
                <button
                  onClick={() => setCurrentTab('resources')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
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
                      className={`p-4 rounded-2xl glass-panel flex items-center justify-between gap-4 ${
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
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                            <Download className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-slate-950">
                            {res?.title || item.resourceTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                            {(res?.version || item.resourceVersion) && (
                              <span>{res?.version || item.resourceVersion}</span>
                            )}
                            {(res?.category || item.resourceCategory) && (
                              <span>· {res?.category || item.resourceCategory}</span>
                            )}
                            {item.downloadedAt && (
                              <span className="flex items-center gap-1 text-slate-400">
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
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0"
                        >
                          Open Package
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Archived</span>
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
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Forum Topics ({userDiscussions.length})
              </h3>
              {userDiscussions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl glass-panel space-y-2">
                  <p className="text-xs text-slate-500">You have not created any forum topics yet.</p>
                  <button
                    onClick={() => setCurrentTab('community')}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    Start a Discussion
                  </button>
                </div>
              ) : (
                userDiscussions.map((disc) => (
                  <div
                    key={disc.id}
                    className="p-4 rounded-2xl glass-panel flex items-center justify-between gap-4"
                  >
                    <div
                      onClick={() =>
                        onNavigate
                          ? onNavigate('community', { threadId: disc.id })
                          : setCurrentTab('community')
                      }
                      className="cursor-pointer flex-1"
                    >
                      <h4 className="text-xs font-bold text-slate-950 hover:text-blue-600 transition">
                        {disc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {disc.category} · {disc.repliesCount || 0} replies · {disc.likesCount || 0} likes
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await deleteDiscussion(disc.id);
                        showToast('Topic deleted.', 'info');
                      }}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      title="Delete topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Discussion Comments ({userComments.length})
              </h3>
              {loadingActivity ? (
                <div className="h-20 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ) : userComments.length === 0 ? (
                <div className="p-8 text-center rounded-2xl glass-panel text-xs text-slate-500">
                  No replies or comments posted in discussions yet.
                </div>
              ) : (
                userComments.map(({ comment, discussionTitle }) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl glass-panel flex items-start justify-between gap-4"
                  >
                    <div
                      onClick={() =>
                        onNavigate
                          ? onNavigate('community', { threadId: comment.discussionId })
                          : setCurrentTab('community')
                      }
                      className="cursor-pointer flex-1 space-y-1"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-blue-600 font-semibold">
                        <span>Replied in: {discussionTitle}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{comment.content}</p>
                      <span className="text-[10px] text-slate-400 font-mono block">
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
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition shrink-0"
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
              <div className="h-24 rounded-2xl bg-white border border-slate-200 animate-pulse" />
            ) : userReviews.length === 0 ? (
              <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
                <Star className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-950">No resource reviews yet</p>
                <p className="text-xs text-slate-500">
                  Open any resource and visit the Ratings tab to submit a star rating and review.
                </p>
                <button
                  onClick={() => setCurrentTab('resources')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
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
                    className="p-4 rounded-2xl glass-panel flex items-start justify-between gap-4"
                  >
                    <div
                      onClick={() => res && onSelectResource(res)}
                      className={`flex-1 space-y-1.5 ${res ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-950 hover:text-blue-600 transition">
                          {rev.resourceTitle}
                        </span>
                        <div className="flex items-center gap-0.5 text-orange-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.stars ? 'fill-current' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {rev.review ? (
                        <p className="text-xs text-slate-700 leading-relaxed">{rev.review}</p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Star rating only (no text)</p>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono block">
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
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition shrink-0"
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
