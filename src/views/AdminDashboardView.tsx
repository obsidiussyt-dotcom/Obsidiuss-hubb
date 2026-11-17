import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  Pin,
  Lock,
  Unlock,
  Download,
  Users,
  Bell,
  BarChart3,
  Star,
  FolderGit2,
  Tag,
  Flag,
  Mail,
  Upload,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Film,
  Sparkles,
  MessageSquare,
  Hash,
  Search,
  FileDown,
  Activity,
  ExternalLink,
  Copy,
  X,
  Send,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  ChatChannelId,
  ChatMessage,
  Resource,
  ResourceRating,
  Project,
  Announcement,
  Comment,
  ResourceCategory,
  UserProfile,
} from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { RoleBadge } from '../components/RoleBadge';

interface AdminDashboardViewProps {
  openAuth: () => void;
  setCurrentTab: (tab: string) => void;
}

type AdminTab =
  | 'resources'
  | 'projects'
  | 'reels'
  | 'chat'
  | 'announcements'
  | 'categories'
  | 'reviews'
  | 'moderation'
  | 'feedback'
  | 'users'
  | 'analytics';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  openAuth,
  setCurrentTab,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const {
    resources,
    projects,
    announcements,
    discussions,
    categories,
    siteVisits,
    usersList,
    feedbackList,
    reportsList,
    addResource,
    updateResource,
    deleteResource,
    addProject,
    updateProject,
    deleteProject,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addCategory,
    deleteCategory,
    updateDiscussion,
    deleteDiscussion,
    getCommentsForDiscussion,
    deleteComment,
    updateFeedbackStatus,
    deleteFeedback,
    updateReportStatus,
    deleteReport,
    updateUserRole,
    getAllResourceRatings,
    deleteResourceRating,
    reels,
    createReel,
    deleteReel,
    subscribeChannelMessages,
    sendChannelMessage,
    deleteChannelMessage,
    uploadFile,
  } = useData();
  const { showToast } = useToast();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('resources');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const uploadAbortRef = React.useRef<AbortController | null>(null);

  // Resource Form State
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resCategory, setResCategory] = useState<ResourceCategory>('minecraft');
  const [resVersion, setResVersion] = useState('');
  const [resDownloadUrl, setResDownloadUrl] = useState('');
  const [resMirrorUrl, setResMirrorUrl] = useState('');
  const [resThumbnailUrl, setResThumbnailUrl] = useState('');
  const [resFileSize, setResFileSize] = useState('');
  const [resFeatured, setResFeatured] = useState(false);
  const [resChangelog, setResChangelog] = useState('');
  const [resRequirements, setResRequirements] = useState('');
  const [resTags, setResTags] = useState('');
  const [uploadingField, setUploadingField] = useState<'package' | 'thumbnail' | 'projectBanner' | 'reelVideo' | null>(null);
  const [uploadStats, setUploadStats] = useState<{ percent: number; transferredMB: string; totalMB: string; stage: string }>({
    percent: 0,
    transferredMB: '0',
    totalMB: '0',
    stage: 'uploading',
  });
  const [dragTarget, setDragTarget] = useState<'package' | 'thumbnail' | 'projectBanner' | null>(null);

  // Project Form State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projTagline, setProjTagline] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCategory, setProjCategory] = useState('Minecraft Client');
  const [projStatus, setProjStatus] = useState<Project['status']>('Active');
  const [projBannerUrl, setProjBannerUrl] = useState('');
  const [projDemoUrl, setProjDemoUrl] = useState('');
  const [projGithubUrl, setProjGithubUrl] = useState('');
  const [projDownloadUrl, setProjDownloadUrl] = useState('');
  const [projTags, setProjTags] = useState('');
  const [projFeatured, setProjFeatured] = useState(false);

  // Announcement Form State
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annExcerpt, setAnnExcerpt] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<Announcement['category']>('Update');
  const [annPinned, setAnnPinned] = useState(false);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Comment Inspector State for Moderation
  const [inspectingDiscussionId, setInspectingDiscussionId] = useState<string | null>(null);
  const [inspectedComments, setInspectedComments] = useState<Comment[]>([]);

  // Catalog & Admin Filters + Bulk Operations
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceCatFilter, setResourceCatFilter] = useState<string>('all');
  const [resourceSort, setResourceSort] = useState<'newest' | 'downloads' | 'rating'>('newest');
  const [selectedResourceIds, setSelectedResourceIds] = useState<Set<string>>(new Set());

  // Reels Tab & Admin Quick-Publish Reel
  const [reelSearch, setReelSearch] = useState('');
  const [reelCatFilter, setReelCatFilter] = useState<string>('All');
  const [isAddingReel, setIsAddingReel] = useState(false);
  const [reelTitle, setReelTitle] = useState('');
  const [reelCategory, setReelCategory] = useState<'Showcase' | 'Minecraft' | 'Android' | 'Devlog' | 'Tutorial'>('Showcase');
  const [reelVideoUrl, setReelVideoUrl] = useState('');
  const [reelThumbUrl, setReelThumbUrl] = useState('');
  const [reelCaption, setReelCaption] = useState('');

  // Live Chat Admin Controls
  const [adminChatChannel, setAdminChatChannel] = useState<ChatChannelId>('general');
  const [adminChatMessages, setAdminChatMessages] = useState<ChatMessage[]>([]);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [sendingAdminChat, setSendingAdminChat] = useState(false);

  // Moderation & Inbox Filters
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');

  // Users Search & Role Filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Reviews Moderation State
  const [allReviews, setAllReviews] = useState<(ResourceRating & { resourceTitle: string })[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStarFilter, setReviewStarFilter] = useState<number | 'all'>('all');

  const loadAllReviews = React.useCallback(async () => {
    setLoadingReviews(true);
    try {
      const list = await getAllResourceRatings();
      setAllReviews(list);
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  }, [getAllResourceRatings]);

  React.useEffect(() => {
    if (activeAdminTab === 'reviews' || activeAdminTab === 'moderation') {
      loadAllReviews();
    }
  }, [activeAdminTab, loadAllReviews]);

  React.useEffect(() => {
    if (!inspectingDiscussionId) {
      setInspectedComments([]);
      return;
    }
    const unsub = getCommentsForDiscussion(inspectingDiscussionId, setInspectedComments);
    return () => unsub();
  }, [inspectingDiscussionId, getCommentsForDiscussion]);

  React.useEffect(() => {
    if (activeAdminTab !== 'chat') {
      setAdminChatMessages([]);
      return;
    }
    const unsub = subscribeChannelMessages(adminChatChannel, setAdminChatMessages);
    return () => unsub();
  }, [activeAdminTab, adminChatChannel, subscribeChannelMessages]);

  const isAuthorized = isAdmin && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-slate-950">Restricted Area</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          {user
            ? 'This page is not available for your account.'
            : 'Please sign in with an authorized account to continue.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          {!user && (
            <button
              onClick={openAuth}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => setCurrentTab('home')}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Fast Resumable Upload Handler (file picker or drag & drop)
  const uploadTargetFile = async (
    file: File,
    target: 'package' | 'thumbnail' | 'projectBanner' | 'reelVideo'
  ) => {
    const controller = new AbortController();
    uploadAbortRef.current = controller;
    setUploadingField(target);
    setUploadStats({
      percent: 2,
      transferredMB: '0.00',
      totalMB: (file.size / (1024 * 1024)).toFixed(2),
      stage: file.type.startsWith('image/') ? 'compressing' : 'uploading',
    });

    try {
      const folder =
        target === 'package' ? 'resources' : target === 'reelVideo' ? 'reels' : 'images';

      if (target === 'package') {
        const mb = (file.size / (1024 * 1024)).toFixed(2);
        if (!resFileSize) setResFileSize(`${mb} MB`);
        if (!resTitle.trim()) {
          const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
          setResTitle(cleanTitle.slice(0, 120));
        }
      }

      const url = await uploadFile(file, folder, {
        signal: controller.signal,
        allowDataUrlFallback: target === 'thumbnail' || target === 'projectBanner',
        onProgress: (info) => {
          setUploadStats({
            percent: info.percent,
            transferredMB: (info.transferredBytes / (1024 * 1024)).toFixed(2),
            totalMB: (info.totalBytes / (1024 * 1024)).toFixed(2),
            stage: info.stage,
          });
        },
      });

      if (target === 'package') {
        setResDownloadUrl(url);
      } else if (target === 'thumbnail') {
        setResThumbnailUrl(url);
      } else if (target === 'projectBanner') {
        setProjBannerUrl(url);
      } else {
        setReelVideoUrl(url);
      }

      if (url.startsWith('data:')) {
        showToast('Image compressed & attached cleanly!', 'success');
      } else {
        showToast('File uploaded to Firebase Storage!', 'success');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'storage/canceled') {
        showToast('Upload cancelled.', 'info');
      } else {
        showToast(
          'Storage upload unavailable or stalled. Paste a direct GitHub / CDN URL for instant publishing.',
          'error'
        );
      }
    } finally {
      uploadAbortRef.current = null;
      setUploadingField(null);
      setUploadStats({ percent: 0, transferredMB: '0', totalMB: '0', stage: 'uploading' });
    }
  };

  const handleStorageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'package' | 'thumbnail' | 'projectBanner' | 'reelVideo'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadTargetFile(file, target);
    e.target.value = '';
  };

  const handleDropUpload = async (
    e: React.DragEvent,
    target: 'package' | 'thumbnail' | 'projectBanner'
  ) => {
    e.preventDefault();
    setDragTarget(null);
    if (uploadingField) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadTargetFile(file, target);
  };

  // Resource Handlers
  const resetResourceForm = () => {
    setIsAddingResource(false);
    setEditingResourceId(null);
    setResTitle('');
    setResDesc('');
    setResCategory('minecraft');
    setResVersion('');
    setResDownloadUrl('');
    setResMirrorUrl('');
    setResThumbnailUrl('');
    setResFileSize('');
    setResFeatured(false);
    setResChangelog('');
    setResRequirements('');
    setResTags('');
  };

  const handleEditResourceClick = (r: Resource) => {
    setEditingResourceId(r.id);
    setResTitle(r.title);
    setResDesc(r.description);
    setResCategory(r.category);
    setResVersion(r.version);
    setResDownloadUrl(r.downloadUrl);
    setResMirrorUrl(r.mirrorUrl || '');
    setResThumbnailUrl(r.thumbnailUrl || '');
    setResFileSize(r.fileSize);
    setResFeatured(r.featured);
    setResChangelog(r.changelog || '');
    setResRequirements(r.requirements || '');
    setResTags((r.tags || []).join(', '));
    setIsAddingResource(true);
  };

  const handleCloneResourceClick = (r: Resource) => {
    setEditingResourceId(null);
    setResTitle(r.title);
    setResDesc(r.description);
    setResCategory(r.category);
    setResVersion(`${r.version}-next`);
    setResDownloadUrl(r.downloadUrl);
    setResMirrorUrl(r.mirrorUrl || '');
    setResThumbnailUrl(r.thumbnailUrl || '');
    setResFileSize(r.fileSize);
    setResFeatured(r.featured);
    setResChangelog('');
    setResRequirements(r.requirements || '');
    setResTags((r.tags || []).join(', '));
    setIsAddingResource(true);
    showToast('Cloned details — update version and download URL to publish!', 'info');
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resDownloadUrl.trim() || !resVersion.trim()) {
      showToast('Title, version, and download URL are required.', 'error');
      return;
    }

    const tagsArray = resTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingResourceId) {
        await updateResource(editingResourceId, {
          title: resTitle.trim(),
          description: resDesc.trim(),
          category: resCategory,
          version: resVersion.trim(),
          downloadUrl: resDownloadUrl.trim(),
          mirrorUrl: resMirrorUrl.trim() || '',
          thumbnailUrl: resThumbnailUrl.trim(),
          fileSize: resFileSize.trim() || 'N/A',
          featured: resFeatured,
          changelog: resChangelog.trim(),
          requirements: resRequirements.trim(),
          tags: tagsArray,
        });
        showToast('Resource updated!', 'success');
      } else {
        await addResource({
          title: resTitle.trim(),
          description: resDesc.trim(),
          category: resCategory,
          version: resVersion.trim(),
          downloadUrl: resDownloadUrl.trim(),
          mirrorUrl: resMirrorUrl.trim() || undefined,
          thumbnailUrl: resThumbnailUrl.trim(),
          fileSize: resFileSize.trim() || 'N/A',
          featured: resFeatured,
          changelog: resChangelog.trim(),
          requirements: resRequirements.trim(),
          tags: tagsArray,
          authorId: profile?.uid || user.uid,
          authorName: profile?.displayName || 'Obsidiuss',
        });
        showToast('Resource published!', 'success');
      }
      resetResourceForm();
    } catch {
      showToast('Failed to save resource. Verify Firestore permissions.', 'error');
    }
  };

  // Project Handlers
  const resetProjectForm = () => {
    setIsAddingProject(false);
    setEditingProjectId(null);
    setProjTitle('');
    setProjTagline('');
    setProjDesc('');
    setProjCategory('Minecraft Client');
    setProjStatus('Active');
    setProjBannerUrl('');
    setProjDemoUrl('');
    setProjGithubUrl('');
    setProjDownloadUrl('');
    setProjTags('');
    setProjFeatured(false);
  };

  const handleEditProjectClick = (p: Project) => {
    setEditingProjectId(p.id);
    setProjTitle(p.title);
    setProjTagline(p.tagline);
    setProjDesc(p.description);
    setProjCategory(p.category);
    setProjStatus(p.status);
    setProjBannerUrl(p.bannerUrl || '');
    setProjDemoUrl(p.demoUrl || '');
    setProjGithubUrl(p.githubUrl || '');
    setProjDownloadUrl(p.downloadUrl || '');
    setProjTags((p.tags || []).join(', '));
    setProjFeatured(p.featured);
    setIsAddingProject(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projTagline.trim()) {
      showToast('Project title and tagline are required.', 'error');
      return;
    }

    const tagsArray = projTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, {
          title: projTitle.trim(),
          tagline: projTagline.trim(),
          description: projDesc.trim(),
          category: projCategory.trim() || 'Application',
          status: projStatus,
          bannerUrl: projBannerUrl.trim(),
          demoUrl: projDemoUrl.trim() || undefined,
          githubUrl: projGithubUrl.trim() || undefined,
          downloadUrl: projDownloadUrl.trim() || undefined,
          tags: tagsArray,
          featured: projFeatured,
        });
        showToast('Project updated!', 'success');
      } else {
        await addProject({
          title: projTitle.trim(),
          tagline: projTagline.trim(),
          description: projDesc.trim(),
          category: projCategory.trim() || 'Application',
          status: projStatus,
          bannerUrl: projBannerUrl.trim(),
          demoUrl: projDemoUrl.trim() || undefined,
          githubUrl: projGithubUrl.trim() || undefined,
          downloadUrl: projDownloadUrl.trim() || undefined,
          tags: tagsArray,
          featured: projFeatured,
        });
        showToast('Project published!', 'success');
      }
      resetProjectForm();
    } catch {
      showToast('Failed to save project.', 'error');
    }
  };

  // Announcement Handlers
  const resetAnnouncementForm = () => {
    setIsAddingAnnouncement(false);
    setEditingAnnouncementId(null);
    setAnnTitle('');
    setAnnExcerpt('');
    setAnnContent('');
    setAnnCategory('Update');
    setAnnPinned(false);
  };

  const handleEditAnnouncementClick = (ann: Announcement) => {
    setEditingAnnouncementId(ann.id);
    setAnnTitle(ann.title);
    setAnnExcerpt(ann.excerpt);
    setAnnContent(ann.content);
    setAnnCategory(ann.category);
    setAnnPinned(ann.pinned);
    setIsAddingAnnouncement(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      showToast('Title and content are required.', 'error');
      return;
    }

    const excerpt = annExcerpt.trim() || annContent.trim().slice(0, 150);

    try {
      if (editingAnnouncementId) {
        await updateAnnouncement(editingAnnouncementId, {
          title: annTitle.trim(),
          excerpt,
          content: annContent.trim(),
          category: annCategory,
          pinned: annPinned,
        });
        showToast('Announcement updated!', 'success');
      } else {
        await addAnnouncement({
          title: annTitle.trim(),
          excerpt,
          content: annContent.trim(),
          category: annCategory,
          pinned: annPinned,
          authorId: profile?.uid || user.uid,
          authorName: profile?.displayName || 'Obsidiuss',
        });
        showToast('Announcement published!', 'success');
      }
      resetAnnouncementForm();
    } catch {
      showToast('Failed to save announcement.', 'error');
    }
  };

  // Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const slug = catSlug.trim() || catName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      await addCategory({ name: catName.trim(), slug, description: catDesc.trim() });
      setCatName('');
      setCatSlug('');
      setCatDesc('');
      showToast('Category created!', 'success');
    } catch {
      showToast('Failed to create category.', 'error');
    }
  };

  // Starter Data Seeder for fresh databases
  const [seeding, setSeeding] = useState(false);
  const handleSeedStarterData = async () => {
    setSeeding(true);
    try {
      showToast('Seeding starter content to Obsidiuss Hub...', 'info');

      if (categories.length === 0) {
        await addCategory({ name: 'Minecraft Mods & Clients', slug: 'minecraft', description: 'Custom clients, FPS boosters, and QoL mods' });
        await addCategory({ name: 'Android Apps & APKs', slug: 'android', description: 'Native utility APKs and launchers' });
        await addCategory({ name: 'PC Software & Tools', slug: 'pc-software', description: 'Desktop performance tools and scripts' });
      }

      if (resources.length === 0) {
        await addResource({
          title: 'Obsidian Client v2.4 (Performance & PVP)',
          description: 'High-performance Minecraft client with optimized JVM flags, fast chunk loading, built-in keystrokes, and customizable HUD.',
          category: 'minecraft',
          version: '2.4.0',
          downloadUrl: 'https://github.com/obsidiuss/obsidian-client/releases/download/v2.4.0/ObsidianClient-v2.4.0.jar',
          thumbnailUrl: '',
          fileSize: '18.4 MB',
          featured: true,
          changelog: '- 30% reduction in memory overhead\n- Smooth 240Hz frame pacing\n- Updated keystrokes & ping display',
          requirements: 'Java 17+ or Java 21, Minecraft 1.20.x or 1.21.x',
          tags: ['PVP', 'FPS Booster', 'Client', 'Fabric'],
          authorId: profile?.uid || user.uid,
          authorName: 'Bhaskar Yadav (Obsidiuss)',
        });
        await addResource({
          title: 'CraftForge Android Launcher v1.8',
          description: 'Native Android application enabling high-FPS portable Minecraft with Fabric mod loader support and on-screen gesture controls.',
          category: 'android',
          version: '1.8.2',
          downloadUrl: 'https://github.com/obsidiuss/craftforge-android/releases/download/v1.8.2/CraftForge-v1.8.2.apk',
          thumbnailUrl: '',
          fileSize: '32.1 MB',
          featured: true,
          changelog: '- Added Vulkan rendering support\n- Low latency touch mapping\n- Battery saver profile',
          requirements: 'Android 10.0+ (ARM64)',
          tags: ['Android', 'Launcher', 'APK', 'Fabric'],
          authorId: profile?.uid || user.uid,
          authorName: 'Bhaskar Yadav (Obsidiuss)',
        });
      }

      if (projects.length === 0) {
        await addProject({
          title: 'Obsidian Core Modloader',
          tagline: 'Lightweight cross-platform JVM architecture for high-tickrate game engines.',
          description: 'Open-source modular core engineered by Obsidiuss (Bhaskar Yadav) for high-performance client modding, zero-overhead mixins, and low-latency rendering.',
          category: 'Minecraft Client',
          status: 'Active',
          bannerUrl: '',
          demoUrl: 'https://youtube.com/@obsidiuss?feature=shared',
          githubUrl: 'https://github.com/obsidiuss',
          downloadUrl: 'https://github.com/obsidiuss',
          tags: ['Kotlin', 'JVM', 'C++', 'OpenGL'],
          featured: true,
        });
      }

      if (announcements.length === 0) {
        await addAnnouncement({
          title: 'Welcome to OBSIDIUSS HUB – Official Creator & Modding Platform',
          excerpt: 'Welcome to the official hub owned by Bhaskar Yadav (Obsidiuss). Explore verified software, creator reels, live chat rooms, and private DMs.',
          content: 'Welcome to OBSIDIUSS HUB!\n\nThis platform serves as our central portal for all verified software releases, Minecraft clients, Android APKs, developer tools, and community discussions.\n\nKey Platform Features:\n• Verified Downloads & User Reviews\n• Instagram-Style Vertical Reels with sound & comments\n• Real-Time Live Chat Lounge\n• Direct 1-on-1 Messages (DMs)\n• Technical Forum & Devlogs\n\nStay connected on YouTube (@obsidiuss) and join our official Discord!',
          category: 'Release',
          pinned: true,
          authorId: profile?.uid || user.uid,
          authorName: 'Bhaskar Yadav (Obsidiuss)',
        });
      }

      showToast('Starter content seeded successfully!', 'success');
    } catch (err: any) {
      showToast('Seeding error: ' + (err?.message || err), 'error');
    } finally {
      setSeeding(false);
    }
  };

  // Real Analytics Totals
  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);
  const pendingReportsCount = reportsList.filter((r) => r.status === 'pending').length;
  const newFeedbackCount = feedbackList.filter((f) => f.status === 'new').length;
  const topResources = [...resources]
    .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0))
    .slice(0, 5);
  const maxDl = Math.max(1, ...topResources.map((r) => r.downloadsCount || 0));

  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    const matchesRole =
      userRoleFilter === 'all' || (u.role || 'Member').toLowerCase() === userRoleFilter.toLowerCase();
    if (!matchesRole) return false;
    if (!q) return true;
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const filteredAdminResources = resources
    .filter((r) => {
      if (resourceCatFilter === 'featured' && !r.featured) return false;
      if (resourceCatFilter !== 'all' && resourceCatFilter !== 'featured' && r.category !== resourceCatFilter) {
        return false;
      }
      const q = resourceSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.version.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (resourceSort === 'downloads') return (b.downloadsCount || 0) - (a.downloadsCount || 0);
      if (resourceSort === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleBulkResourceAction = async (action: 'feature' | 'unfeature' | 'delete') => {
    const ids = Array.from(selectedResourceIds);
    if (ids.length === 0) return;
    try {
      await Promise.all(
        ids.map((id) => {
          if (action === 'delete') return deleteResource(id);
          return updateResource(id, { featured: action === 'feature' });
        })
      );
      setSelectedResourceIds(new Set());
      showToast(
        action === 'delete'
          ? `Deleted ${ids.length} resources.`
          : `Updated ${ids.length} resources.`,
        'success'
      );
    } catch {
      showToast('Some bulk updates failed.', 'error');
    }
  };

  const handleAdminPublishReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelTitle.trim() || !reelVideoUrl.trim()) {
      showToast('Reel title and video URL are required.', 'error');
      return;
    }
    try {
      await createReel({
        title: reelTitle.trim(),
        category: reelCategory,
        videoUrl: reelVideoUrl.trim(),
        thumbnailUrl: reelThumbUrl.trim() || undefined,
        caption: reelCaption.trim() || undefined,
      });
      setReelTitle('');
      setReelVideoUrl('');
      setReelThumbUrl('');
      setReelCaption('');
      setIsAddingReel(false);
      showToast('Reel published live!', 'success');
    } catch {
      showToast('Failed to publish reel.', 'error');
    }
  };

  const handleAdminSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatInput.trim() || sendingAdminChat) return;
    setSendingAdminChat(true);
    try {
      await sendChannelMessage(adminChatChannel, adminChatInput.trim());
      setAdminChatInput('');
    } catch {
      showToast('Failed to send message.', 'error');
    } finally {
      setSendingAdminChat(false);
    }
  };

  const filteredAdminReels = reels.filter((reel) => {
    const matchesCat =
      reelCatFilter === 'All' || reel.category.toLowerCase() === reelCatFilter.toLowerCase();
    if (!matchesCat) return false;
    const q = reelSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      reel.title.toLowerCase().includes(q) ||
      reel.authorName.toLowerCase().includes(q) ||
      (reel.caption || '').toLowerCase().includes(q)
    );
  });

  const exportUsersCsv = () => {
    const rows = [
      ['UID', 'DisplayName', 'Email', 'Role', 'Downloads', 'JoinedAt'].join(','),
      ...usersList.map((u) =>
        [
          u.uid,
          `"${(u.displayName || '').replace(/"/g, '""')}"`,
          `"${(u.email || '').replace(/"/g, '""')}"`,
          u.role || 'Member',
          String(u.downloadsCount || 0),
          u.joinedAt || '',
        ].join(',')
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obsidiuss-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported member directory CSV.', 'success');
  };

  const exportAnalyticsJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      totals: {
        siteVisits,
        totalDownloads,
        resources: resources.length,
        projects: projects.length,
        reels: reels.length,
        discussions: discussions.length,
        registeredUsers: usersList.length,
        pendingReports: pendingReportsCount,
        newFeedback: newFeedbackCount,
      },
      topResources: topResources.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        version: r.version,
        downloadsCount: r.downloadsCount || 0,
        rating: r.rating || 0,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obsidiuss-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported hub analytics report JSON.', 'success');
  };

  const renderDeleteButton = (key: string, onConfirm: () => Promise<void> | void) => {
    if (confirmDeleteKey === key) {
      return (
        <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              setConfirmDeleteKey(null);
            }}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-800"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeleteKey(null)}
            className="text-[11px] text-slate-500 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setConfirmDeleteKey(key)}
        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
        title="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    );
  };

  const inputCls =
    'w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border-blue-200/80 bg-gradient-to-r from-white via-blue-50/40 to-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                OBSIDIUSS Admin Control
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Creator Access</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Signed in as <strong className="text-slate-900">{user.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {resources.length === 0 && (
            <button
              type="button"
              onClick={handleSeedStarterData}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition shrink-0 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Seeding...' : 'Seed Starter Content'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={exportAnalyticsJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-bold transition shrink-0"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Live Overview KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: 'Site Visits',
            value: siteVisits.toLocaleString(),
            icon: Activity,
            tab: 'analytics' as AdminTab,
          },
          {
            label: 'Downloads',
            value: totalDownloads.toLocaleString(),
            icon: Download,
            tab: 'resources' as AdminTab,
          },
          {
            label: 'Members',
            value: usersList.length.toLocaleString(),
            icon: Users,
            tab: 'users' as AdminTab,
          },
          {
            label: 'Reels',
            value: reels.length.toLocaleString(),
            icon: Film,
            tab: 'reels' as AdminTab,
          },
          {
            label: 'Pending Reports',
            value: pendingReportsCount.toLocaleString(),
            icon: Flag,
            tab: 'moderation' as AdminTab,
            highlight: pendingReportsCount > 0,
          },
          {
            label: 'New Inbox',
            value: newFeedbackCount.toLocaleString(),
            icon: Mail,
            tab: 'feedback' as AdminTab,
            highlight: newFeedbackCount > 0,
          },
        ].map((kpi) => {
          const KpiIcon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={() => setActiveAdminTab(kpi.tab)}
              className={`p-3.5 rounded-2xl glass-panel text-left transition hover:border-blue-300 ${
                kpi.highlight ? 'border-blue-300 bg-blue-50/40' : ''
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>{kpi.label}</span>
                <KpiIcon className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="font-display text-xl font-black text-slate-950 font-mono tabular-nums mt-1">
                {kpi.value}
              </div>
            </button>
          );
        })}
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {(
          [
            { id: 'resources', label: `Resources (${resources.length})`, icon: Download },
            { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
            { id: 'reels', label: `Reels (${reels.length})`, icon: Film },
            { id: 'chat', label: 'Live Chat', icon: MessageSquare },
            { id: 'announcements', label: `Updates (${announcements.length})`, icon: Bell },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Tag },
            { id: 'reviews', label: `Reviews (${allReviews.length})`, icon: Star },
            {
              id: 'moderation',
              label: `Moderation (${discussions.length}${pendingReportsCount ? ` · ${pendingReportsCount}` : ''})`,
              icon: Flag,
            },
            {
              id: 'feedback',
              label: `Inbox (${feedbackList.length}${newFeedbackCount ? ` · ${newFeedbackCount}` : ''})`,
              icon: Mail,
            },
            { id: 'users', label: `Users (${usersList.length})`, icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white border border-transparent hover:border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RESOURCES */}
      {activeAdminTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-slate-950">
              Resource Catalogue &amp; Uploads
            </h2>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Filter resources..."
                  className="pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => {
                  if (isAddingResource) resetResourceForm();
                  else setIsAddingResource(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingResource ? 'Close Form' : 'Publish Resource'}</span>
              </button>
            </div>
          </div>

          {isAddingResource && (
            <form
              onSubmit={handleSaveResource}
              className="p-6 rounded-3xl glass-panel border-blue-200 space-y-4 animate-modal-pop"
            >
              <h3 className="text-sm font-bold text-blue-700">
                {editingResourceId ? 'Edit Resource' : 'Publish New Resource'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    placeholder="e.g. Velocity Client"
                    maxLength={120}
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value)}
                    className={inputCls}
                  >
                    <option value="minecraft">Minecraft</option>
                    <option value="android">Android</option>
                    <option value="pc-software">PC Software</option>
                    <option value="source-code">Source Code</option>
                    <option value="tutorials">Tutorials</option>
                    <option value="dev-tools">Dev Tools</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Version *</label>
                  <input
                    type="text"
                    value={resVersion}
                    onChange={(e) => setResVersion(e.target.value)}
                    placeholder="v1.0.0"
                    maxLength={30}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">File Size</label>
                  <input
                    type="text"
                    value={resFileSize}
                    onChange={(e) => setResFileSize(e.target.value)}
                    placeholder="e.g. 12.4 MB"
                    maxLength={30}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={resTags}
                    onChange={(e) => setResTags(e.target.value)}
                    placeholder="Minecraft, Fabric, FPS"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragTarget('package');
                  }}
                  onDragLeave={() => setDragTarget((prev) => (prev === 'package' ? null : prev))}
                  onDrop={(e) => handleDropUpload(e, 'package')}
                  className={`p-3 rounded-2xl border transition ${
                    dragTarget === 'package'
                      ? 'border-blue-500 bg-blue-50/70'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Direct Download URL * <span className="text-[10px] font-normal text-slate-400">(or drop file here)</span>
                    </label>
                    {uploadingField === 'package' ? (
                      <button
                        type="button"
                        onClick={() => uploadAbortRef.current?.abort()}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel ({uploadStats.percent}%)</span>
                      </button>
                    ) : (
                      <label className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleStorageUpload(e, 'package')}
                          disabled={uploadingField !== null}
                        />
                      </label>
                    )}
                  </div>
                  <input
                    type="url"
                    value={resDownloadUrl}
                    onChange={(e) => setResDownloadUrl(e.target.value)}
                    placeholder="https://github.com/.../release.jar or drop file"
                    required
                    className={inputCls}
                  />
                  {uploadingField === 'package' && (
                    <div className="mt-2 space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-150"
                          style={{ width: `${Math.max(5, uploadStats.percent)}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-slate-500">
                        {uploadStats.percent}% · {uploadStats.transferredMB} / {uploadStats.totalMB} MB
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mirror URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={resMirrorUrl}
                    onChange={(e) => setResMirrorUrl(e.target.value)}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragTarget('thumbnail');
                }}
                onDragLeave={() => setDragTarget((prev) => (prev === 'thumbnail' ? null : prev))}
                onDrop={(e) => handleDropUpload(e, 'thumbnail')}
                className={`p-3 rounded-2xl border transition ${
                  dragTarget === 'thumbnail'
                    ? 'border-blue-500 bg-blue-50/70'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Thumbnail Image URL <span className="text-[10px] font-normal text-slate-400">(auto-compressed fast upload or drop image)</span>
                  </label>
                  {uploadingField === 'thumbnail' ? (
                    <button
                      type="button"
                      onClick={() => uploadAbortRef.current?.abort()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel ({uploadStats.percent}%)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {resThumbnailUrl && (
                        <button
                          type="button"
                          onClick={() => setResThumbnailUrl('')}
                          className="text-[11px] font-semibold text-rose-600 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                      <label className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleStorageUpload(e, 'thumbnail')}
                          disabled={uploadingField !== null}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {resThumbnailUrl && (
                    <img
                      src={resThumbnailUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    value={resThumbnailUrl}
                    onChange={(e) => setResThumbnailUrl(e.target.value)}
                    placeholder="https://... or upload/drop image"
                    className={inputCls}
                  />
                </div>
                {uploadingField === 'thumbnail' && (
                  <div className="mt-2 w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-150"
                      style={{ width: `${Math.max(8, uploadStats.percent)}%` }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  rows={3}
                  maxLength={5000}
                  placeholder="Describe features and usage..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Changelog</label>
                  <textarea
                    value={resChangelog}
                    onChange={(e) => setResChangelog(e.target.value)}
                    rows={2}
                    maxLength={3000}
                    placeholder="Release notes..."
                    className={`${inputCls} resize-none font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Requirements</label>
                  <textarea
                    value={resRequirements}
                    onChange={(e) => setResRequirements(e.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder="e.g. Fabric 1.20.4, Android 10+..."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={resFeatured}
                  onChange={(e) => setResFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="featured-check" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Feature on Homepage
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetResourceForm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition"
                >
                  {editingResourceId ? 'Update Resource' : 'Publish Resource'}
                </button>
              </div>
            </form>
          )}

          {/* Resource Filter Bar & Bulk Selection Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'featured', label: 'Featured' },
                { id: 'minecraft', label: 'Minecraft' },
                { id: 'android', label: 'Android' },
                { id: 'pc-software', label: 'PC Software' },
                { id: 'source-code', label: 'Source Code' },
                { id: 'dev-tools', label: 'Dev Tools' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setResourceCatFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    resourceCatFilter === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={resourceSort}
                onChange={(e) => setResourceSort(e.target.value as 'newest' | 'downloads' | 'rating')}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="downloads">Most Downloaded</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {selectedResourceIds.size > 0 && (
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-blue-800">
                {selectedResourceIds.size} selected
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleBulkResourceAction('feature')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  Feature
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkResourceAction('unfeature')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Unfeature
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkResourceAction('delete')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                >
                  Delete Selected
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedResourceIds(new Set())}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="rounded-3xl glass-panel overflow-hidden">
            {filteredAdminResources.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                {resources.length === 0
                  ? 'No resources published yet. Click "Publish Resource" to add your first release.'
                  : 'No resources match your current filter.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4 w-8">
                        <input
                          type="checkbox"
                          checked={
                            filteredAdminResources.length > 0 &&
                            filteredAdminResources.every((r) => selectedResourceIds.has(r.id))
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResourceIds(new Set(filteredAdminResources.map((r) => r.id)));
                            } else {
                              setSelectedResourceIds(new Set());
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      <th className="p-4">Resource</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Version</th>
                      <th className="p-4">Downloads</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAdminResources.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedResourceIds.has(r.id)}
                            onChange={(e) => {
                              setSelectedResourceIds((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(r.id);
                                else next.delete(r.id);
                                return next;
                              });
                            }}
                            className="rounded border-slate-300 text-blue-600"
                          />
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          {r.thumbnailUrl ? (
                            <img src={r.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                              <Download className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-950">{r.title}</p>
                            <p className="text-[11px] text-slate-500">{r.fileSize}</p>
                          </div>
                        </td>
                        <td className="p-4 uppercase text-[10px] font-bold text-blue-600">
                          {r.category}
                        </td>
                        <td className="p-4 font-mono text-slate-700">{r.version}</td>
                        <td className="p-4 font-mono font-bold text-slate-900 tabular-nums">
                          {(r.downloadsCount || 0).toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateResource(r.id, { featured: !r.featured })}
                              className={`p-1.5 rounded-lg transition ${
                                r.featured
                                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                  : 'bg-slate-100 text-slate-400 hover:text-orange-500'
                              }`}
                              title={r.featured ? 'Remove from featured' : 'Feature on homepage'}
                            >
                              <Star className={`w-3.5 h-3.5 ${r.featured ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleCloneResourceClick(r)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Clone / Publish New Version"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditResourceClick(r)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-950 hover:bg-slate-200"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {renderDeleteButton(`res-${r.id}`, async () => {
                              await deleteResource(r.id);
                              showToast('Resource deleted.', 'info');
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS */}
      {activeAdminTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-950">Projects Showcase Manager</h2>
            <button
              onClick={() => {
                if (isAddingProject) resetProjectForm();
                else setIsAddingProject(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingProject ? 'Close Form' : 'Add Project'}</span>
            </button>
          </div>

          {isAddingProject && (
            <form
              onSubmit={handleSaveProject}
              className="p-6 rounded-3xl glass-panel border-blue-200 space-y-4 animate-modal-pop"
            >
              <h3 className="text-sm font-bold text-blue-700">
                {editingProjectId ? 'Edit Project' : 'Publish New Project'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    maxLength={120}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    placeholder="e.g. Minecraft Client, Android App"
                    maxLength={50}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as Project['status'])}
                    className={inputCls}
                  >
                    <option value="Active">Active</option>
                    <option value="Beta">Beta</option>
                    <option value="In Development">In Development</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline *</label>
                <input
                  type="text"
                  value={projTagline}
                  onChange={(e) => setProjTagline(e.target.value)}
                  maxLength={200}
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={3}
                  maxLength={5000}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragTarget('projectBanner');
                  }}
                  onDragLeave={() => setDragTarget((prev) => (prev === 'projectBanner' ? null : prev))}
                  onDrop={(e) => handleDropUpload(e, 'projectBanner')}
                  className={`p-3 rounded-2xl border transition ${
                    dragTarget === 'projectBanner'
                      ? 'border-blue-500 bg-blue-50/70'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Banner Image URL <span className="text-[10px] font-normal text-slate-400">(auto-compressed)</span>
                    </label>
                    {uploadingField === 'projectBanner' ? (
                      <button
                        type="button"
                        onClick={() => uploadAbortRef.current?.abort()}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel ({uploadStats.percent}%)</span>
                      </button>
                    ) : (
                      <label className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleStorageUpload(e, 'projectBanner')}
                          disabled={uploadingField !== null}
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {projBannerUrl && (
                      <img
                        src={projBannerUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    <input
                      type="text"
                      value={projBannerUrl}
                      onChange={(e) => setProjBannerUrl(e.target.value)}
                      placeholder="https://... or upload/drop image"
                      className={inputCls}
                    />
                  </div>
                  {uploadingField === 'projectBanner' && (
                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-150"
                        style={{ width: `${Math.max(8, uploadStats.percent)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tech Tags (comma separated)</label>
                  <input
                    type="text"
                    value={projTags}
                    onChange={(e) => setProjTags(e.target.value)}
                    placeholder="TypeScript, Java, Kotlin"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub / Source URL</label>
                  <input
                    type="url"
                    value={projGithubUrl}
                    onChange={(e) => setProjGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={projDemoUrl}
                    onChange={(e) => setProjDemoUrl(e.target.value)}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Build Download URL</label>
                  <input
                    type="url"
                    value={projDownloadUrl}
                    onChange={(e) => setProjDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="proj-featured"
                  checked={projFeatured}
                  onChange={(e) => setProjFeatured(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="proj-featured" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Mark as Featured Project
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetProjectForm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition"
                >
                  {editingProjectId ? 'Update Project' : 'Publish Project'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="p-10 text-center rounded-3xl glass-panel text-xs text-slate-500">
                No projects published yet.
              </div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl glass-panel flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{p.status}</span>
                      <span className="text-xs font-bold text-slate-950">{p.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{p.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateProject(p.id, { featured: !p.featured })}
                      className={`p-1.5 rounded-lg ${
                        p.featured ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'
                      }`}
                      title="Toggle featured"
                    >
                      <Star className={`w-3.5 h-3.5 ${p.featured ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleEditProjectClick(p)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-950"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {renderDeleteButton(`proj-${p.id}`, async () => {
                      await deleteProject(p.id);
                      showToast('Project deleted.', 'info');
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2B: REELS MANAGER */}
      {activeAdminTab === 'reels' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-950">
                Reels &amp; Short Clips Manager ({reels.length})
              </h2>
              <p className="text-xs text-slate-500">
                Monitor views, engagement, and remove inappropriate video reels.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reelSearch}
                  onChange={(e) => setReelSearch(e.target.value)}
                  placeholder="Search reels or creators..."
                  className="pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsAddingReel(!isAddingReel)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingReel ? 'Close Form' : 'Publish Reel'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('reels')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Reels Studio</span>
              </button>
            </div>
          </div>

          {isAddingReel && (
            <form
              onSubmit={handleAdminPublishReel}
              className="p-5 rounded-2xl glass-panel border-blue-200 space-y-4 animate-modal-pop"
            >
              <h3 className="text-sm font-bold text-blue-700">Quick Publish Reel</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={reelTitle}
                    onChange={(e) => setReelTitle(e.target.value)}
                    placeholder="e.g. Client HUD Showcase"
                    maxLength={120}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={reelCategory}
                    onChange={(e) => setReelCategory(e.target.value as any)}
                    className={inputCls}
                  >
                    <option value="Showcase">Showcase</option>
                    <option value="Minecraft">Minecraft</option>
                    <option value="Android">Android</option>
                    <option value="Devlog">Devlog</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Video URL / YouTube Short *</label>
                    {uploadingField === 'reelVideo' ? (
                      <button
                        type="button"
                        onClick={() => uploadAbortRef.current?.abort()}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel ({uploadStats.percent}%)</span>
                      </button>
                    ) : (
                      <label className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Upload Video</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          className="hidden"
                          onChange={(e) => handleStorageUpload(e, 'reelVideo')}
                          disabled={uploadingField !== null}
                        />
                      </label>
                    )}
                  </div>
                  <input
                    type="url"
                    value={reelVideoUrl}
                    onChange={(e) => setReelVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/... or .mp4"
                    maxLength={1500}
                    required
                    className={inputCls}
                  />
                  {uploadingField === 'reelVideo' && (
                    <div className="mt-1.5 w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-150"
                        style={{ width: `${Math.max(5, uploadStats.percent)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Poster Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    value={reelThumbUrl}
                    onChange={(e) => setReelThumbUrl(e.target.value)}
                    placeholder="https://..."
                    maxLength={1500}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Caption (Optional)</label>
                <input
                  type="text"
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                  maxLength={500}
                  placeholder="Short description..."
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReel(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingField !== null}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  Publish Reel
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['All', 'Showcase', 'Minecraft', 'Android', 'Devlog', 'Tutorial'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setReelCatFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  reelCatFilter === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredAdminReels.length === 0 ? (
            <div className="p-10 text-center rounded-2xl glass-panel text-xs text-slate-500">
              No reels match your current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAdminReels.map((reel) => (
                <div
                  key={reel.id}
                  className="p-4 rounded-2xl glass-panel flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {reel.thumbnailUrl ? (
                        <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover" />
                      ) : (
                        <Film className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {reel.category}
                        </span>
                        <span className="text-xs font-bold text-slate-950 truncate">{reel.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        By {reel.authorName} · {reel.likesCount || 0} likes · {reel.commentsCount || 0} replies · {reel.viewsCount || 0} views
                      </p>
                    </div>
                  </div>

                  {renderDeleteButton(`admin-reel-${reel.id}`, async () => {
                    await deleteReel(reel.id);
                    showToast('Reel deleted.', 'info');
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2C: LIVE CHAT CHANNEL MODERATION */}
      {activeAdminTab === 'chat' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-950">
                Live Chat Channel Moderation
              </h2>
              <p className="text-xs text-slate-500">
                Inspect messages across public channels in real time and remove spam instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('chat')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition self-start sm:self-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Live Chat</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(
              [
                { id: 'general', label: 'general-lounge' },
                { id: 'minecraft-dev', label: 'minecraft-dev' },
                { id: 'android-hub', label: 'android-hub' },
                { id: 'help-desk', label: 'help-desk' },
              ] as const
            ).map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setAdminChatChannel(ch.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  adminChatChannel === ch.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>{ch.label}</span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl glass-panel overflow-hidden">
            {adminChatMessages.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No messages in #{adminChatChannel} yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 max-h-[460px] overflow-y-auto">
                {adminChatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <UserAvatar
                        src={msg.senderAvatar}
                        name={msg.senderName}
                        sizeClass="w-8 h-8 text-xs"
                        className="rounded-lg shrink-0"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-950">{msg.senderName}</span>
                          <RoleBadge role={msg.senderRole} size="xs" />
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 break-words whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>

                    {renderDeleteButton(`chat-${msg.id}`, async () => {
                      await deleteChannelMessage(adminChatChannel, msg.id);
                      showToast('Chat message removed.', 'info');
                    })}
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleAdminSendChat}
              className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={adminChatInput}
                onChange={(e) => setAdminChatInput(e.target.value)}
                placeholder={`Post to #${adminChatChannel} as ${profile?.displayName || 'Creator'}...`}
                maxLength={1000}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!adminChatInput.trim() || sendingAdminChat}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENTS */}
      {activeAdminTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-950">Changelogs &amp; Broadcasts</h2>
            <button
              onClick={() => {
                if (isAddingAnnouncement) resetAnnouncementForm();
                else setIsAddingAnnouncement(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingAnnouncement ? 'Close Form' : 'New Announcement'}</span>
            </button>
          </div>

          {isAddingAnnouncement && (
            <form
              onSubmit={handleSaveAnnouncement}
              className="p-6 rounded-3xl glass-panel border-blue-200 space-y-4 animate-modal-pop"
            >
              <h3 className="text-sm font-bold text-blue-700">
                {editingAnnouncementId ? 'Edit Announcement' : 'Publish Announcement'}
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  maxLength={150}
                  required
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as Announcement['category'])}
                    className={inputCls}
                  >
                    <option value="Update">Update</option>
                    <option value="Release">Release</option>
                    <option value="Community">Community</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Important">Important</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Excerpt</label>
                  <input
                    type="text"
                    value={annExcerpt}
                    onChange={(e) => setAnnExcerpt(e.target.value)}
                    maxLength={300}
                    placeholder="Brief summary..."
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Content *</label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  rows={5}
                  maxLength={10000}
                  required
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ann-pinned-check"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="ann-pinned-check" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Pin announcement to top of feed
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetAnnouncementForm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition"
                >
                  {editingAnnouncementId ? 'Update Announcement' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="p-10 text-center rounded-3xl glass-panel text-xs text-slate-500">
                No announcements published yet.
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-5 rounded-2xl glass-panel flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {ann.pinned && (
                        <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                          Pinned
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-950">{ann.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{ann.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateAnnouncement(ann.id, { pinned: !ann.pinned })}
                      className={`p-1.5 rounded-lg ${
                        ann.pinned ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'
                      }`}
                      title="Toggle pin"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditAnnouncementClick(ann)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-950"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {renderDeleteButton(`ann-${ann.id}`, async () => {
                      await deleteAnnouncement(ann.id);
                      showToast('Announcement deleted.', 'info');
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-6">
          <h2 className="font-display text-lg font-bold text-slate-950">Custom Resource Categories</h2>

          <form
            onSubmit={handleAddCategory}
            className="p-5 rounded-3xl glass-panel grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Resource Packs"
                maxLength={80}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slug (Optional)</label>
              <input
                type="text"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                placeholder="resource-packs"
                maxLength={50}
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Short summary..."
                maxLength={300}
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition"
            >
              Add Category
            </button>
          </form>

          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-xs text-slate-500 p-6 rounded-2xl glass-panel text-center">
                No custom categories added yet. Built-in categories (Minecraft, Android, PC Software,
                Source Codes, Tutorials, Dev Tools) are always available.
              </p>
            ) : (
              categories.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl glass-panel flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-950">{c.name}</span>
                    <span className="ml-2 text-[11px] font-mono text-blue-600">/{c.slug}</span>
                    {c.description && <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>}
                  </div>
                  {renderDeleteButton(`cat-${c.id}`, async () => {
                    await deleteCategory(c.id);
                    showToast('Category deleted.', 'info');
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4B: RESOURCE REVIEWS MODERATION */}
      {activeAdminTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-950">
                Ratings &amp; Reviews Moderation ({allReviews.length})
              </h2>
              <p className="text-xs text-slate-600">
                Inspect and remove spam, abusive, or off-topic reviews across all published resources.
              </p>
            </div>
            <button
              type="button"
              onClick={loadAllReviews}
              disabled={loadingReviews}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReviews ? 'animate-spin' : ''}`} />
              <span>Refresh Reviews</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={reviewSearch}
              onChange={(e) => setReviewSearch(e.target.value)}
              placeholder="Search by user, resource, or review text..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 5, 4, 3, 2, 1] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setReviewStarFilter(val)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap ${
                    reviewStarFilter === val
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                  }`}
                >
                  {val === 'all' ? (
                    <span>All Stars</span>
                  ) : (
                    <>
                      <span>{val}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loadingReviews ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (() => {
            const q = reviewSearch.trim().toLowerCase();
            const filteredReviews = allReviews.filter((rev) => {
              const matchesStar = reviewStarFilter === 'all' || Math.round(rev.stars) === reviewStarFilter;
              const matchesQuery =
                !q ||
                rev.userName.toLowerCase().includes(q) ||
                rev.resourceTitle.toLowerCase().includes(q) ||
                (rev.review || '').toLowerCase().includes(q);
              return matchesStar && matchesQuery;
            });

            if (filteredReviews.length === 0) {
              return (
                <div className="p-10 text-center rounded-3xl glass-panel text-xs text-slate-500">
                  {allReviews.length === 0
                    ? 'No community resource reviews have been submitted yet.'
                    : 'No reviews match your current search or star filter.'}
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filteredReviews.map((rev) => (
                  <div
                    key={`${rev.resourceId}-${rev.userId}`}
                    className="p-4 sm:p-5 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <UserAvatar
                        src={rev.userAvatar}
                        name={rev.userName}
                        sizeClass="w-9 h-9 text-xs"
                        className="rounded-xl shrink-0"
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-950">{rev.userName}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-semibold text-blue-600">
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
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {rev.review}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Star rating only (no written review)</p>
                        )}
                        <p className="text-[10px] font-mono text-slate-400">
                          Submitted {new Date(rev.createdAt).toLocaleString()} · User ID: {rev.userId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      {renderDeleteButton(`rev-${rev.resourceId}-${rev.userId}`, async () => {
                        await deleteResourceRating(rev.resourceId, rev.userId);
                        setAllReviews((prev) =>
                          prev.filter(
                            (item) => !(item.resourceId === rev.resourceId && item.userId === rev.userId)
                          )
                        );
                        showToast('Review deleted and resource average updated.', 'info');
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 5: MODERATION & REPORTS */}
      {activeAdminTab === 'moderation' && (
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-slate-950">
                Reported Content Queue ({reportsList.length})
              </h2>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['all', 'pending', 'resolved', 'dismissed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReportStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                      reportStatusFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            {reportsList.filter((r) => reportStatusFilter === 'all' || r.status === reportStatusFilter).length === 0 ? (
              <div className="p-8 text-center rounded-2xl glass-panel text-xs text-slate-500">
                No reports match this status.
              </div>
            ) : (
              reportsList
                .filter((r) => reportStatusFilter === 'all' || r.status === reportStatusFilter)
                .map((rep) => {
                const isReviewReport = rep.targetType === 'review' && rep.targetId.includes(':');
                const [repResId, repUserId] = isReviewReport ? rep.targetId.split(':') : ['', ''];
                return (
                  <div
                    key={rep.id}
                    className="p-5 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                          {rep.targetType}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rep.status === 'pending'
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : rep.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {rep.status}
                        </span>
                        <span className="text-xs font-bold text-slate-950">{rep.reason}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Target ID: {rep.targetId} · Reporter: {rep.reporterId}
                      </p>
                      {rep.details && <p className="text-xs text-slate-700">{rep.details}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {isReviewReport && repResId && repUserId && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await deleteResourceRating(repResId, repUserId);
                              await updateReportStatus(rep.id, 'resolved');
                              setAllReviews((prev) =>
                                prev.filter(
                                  (item) => !(item.resourceId === repResId && item.userId === repUserId)
                                )
                              );
                              showToast('Flagged review deleted and report resolved.', 'success');
                            } catch {
                              showToast('Could not remove review (it may already be deleted).', 'info');
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition"
                        >
                          Remove Review
                        </button>
                      )}
                      {rep.targetType === 'reel' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await deleteReel(rep.targetId);
                              await updateReportStatus(rep.id, 'resolved');
                              showToast('Flagged reel deleted and report resolved.', 'success');
                            } catch {
                              showToast('Could not remove reel (it may already be deleted).', 'info');
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition"
                        >
                          Remove Reel
                        </button>
                      )}
                      <button
                        onClick={() => updateReportStatus(rep.id, 'resolved')}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        title="Mark resolved"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateReportStatus(rep.id, 'dismissed')}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                        title="Dismiss"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      {renderDeleteButton(`rep-${rep.id}`, async () => {
                        await deleteReport(rep.id);
                        showToast('Report removed.', 'info');
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-950">
              Forum Threads &amp; Comments ({discussions.length})
            </h2>
            {discussions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl glass-panel text-xs text-slate-500">
                No forum discussions posted yet.
              </div>
            ) : (
              discussions.map((disc) => (
                <div
                  key={disc.id}
                  className="p-5 rounded-2xl glass-panel space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {disc.category}
                        </span>
                        {disc.pinned && (
                          <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                            Pinned
                          </span>
                        )}
                        {disc.locked && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            Locked
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-950">{disc.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Author: {disc.authorName} ({disc.authorRole}) · {disc.repliesCount || 0} replies · {disc.likesCount || 0} likes
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setInspectingDiscussionId(
                            inspectingDiscussionId === disc.id ? null : disc.id
                          )
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Comments</span>
                      </button>
                      <button
                        onClick={() => updateDiscussion(disc.id, { pinned: !disc.pinned })}
                        className={`p-1.5 rounded-lg ${
                          disc.pinned ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'
                        }`}
                        title="Pin/Unpin"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateDiscussion(disc.id, { locked: !disc.locked })}
                        className={`p-1.5 rounded-lg ${
                          disc.locked ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
                        }`}
                        title="Lock/Unlock"
                      >
                        {disc.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                      {renderDeleteButton(`disc-${disc.id}`, async () => {
                        await deleteDiscussion(disc.id);
                        showToast('Discussion removed.', 'info');
                      })}
                    </div>
                  </div>

                  {inspectingDiscussionId === disc.id && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[11px] font-bold uppercase text-slate-500">
                        Replies ({inspectedComments.length})
                      </p>
                      {inspectedComments.length === 0 ? (
                        <p className="text-xs text-slate-400">No replies in this thread.</p>
                      ) : (
                        inspectedComments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-950">{c.authorName}</span>
                              <p className="text-xs text-slate-700 mt-0.5">{c.content}</p>
                            </div>
                            {renderDeleteButton(`cmt-${c.id}`, async () => {
                              await deleteComment(disc.id, c.id);
                              showToast('Comment removed.', 'info');
                            })}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-950 flex items-center gap-2">
              <Film className="w-4 h-4 text-pink-600" />
              <span>Published Reels ({reels.length})</span>
            </h2>
            {reels.length === 0 ? (
              <div className="p-8 text-center rounded-2xl glass-panel text-xs text-slate-500">
                No community reels published yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {reels.map((reel) => (
                  <div
                    key={reel.id}
                    className="p-4 rounded-2xl glass-panel flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                          {reel.category}
                        </span>
                        <span className="text-xs font-bold text-slate-950 truncate">{reel.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Creator: {reel.authorName} · {reel.likesCount || 0} likes · {reel.commentsCount || 0} comments · {reel.viewsCount || 0} views
                      </p>
                    </div>
                    {renderDeleteButton(`reel-${reel.id}`, async () => {
                      await deleteReel(reel.id);
                      showToast('Reel removed.', 'info');
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: FEEDBACK INBOX */}
      {activeAdminTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-slate-950">
              Contact &amp; Feedback Inbox ({feedbackList.length})
            </h2>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'new', 'reviewed', 'resolved'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFeedbackStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                    feedbackStatusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
          {feedbackList.filter((fb) => feedbackStatusFilter === 'all' || fb.status === feedbackStatusFilter).length === 0 ? (
            <div className="p-10 text-center rounded-3xl glass-panel text-xs text-slate-500">
              No messages match this status filter.
            </div>
          ) : (
            feedbackList
              .filter((fb) => feedbackStatusFilter === 'all' || fb.status === feedbackStatusFilter)
              .map((fb) => (
              <div
                key={fb.id}
                className="p-5 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        fb.status === 'new'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : fb.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {fb.status}
                    </span>
                    <span className="text-sm font-bold text-slate-950">{fb.subject}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    From <strong className="text-slate-900">{fb.name}</strong> ({fb.email}) ·{' '}
                    {new Date(fb.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-1">
                    {fb.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(fb.email);
                      showToast(`Copied ${fb.email}`, 'info');
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition"
                    title="Copy email"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {fb.id && (
                    <>
                      <button
                        onClick={() => updateFeedbackStatus(fb.id!, 'reviewed')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => updateFeedbackStatus(fb.id!, 'resolved')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-700"
                      >
                        Resolve
                      </button>
                      {renderDeleteButton(`fb-${fb.id}`, async () => {
                        await deleteFeedback(fb.id!);
                        showToast('Message deleted.', 'info');
                      })}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 7: USERS */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-slate-950">
              Registered Users ({usersList.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search name, email, or role..."
                  className="w-full sm:w-64 pl-8 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={exportUsersCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-xs font-bold transition"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['all', 'Creator', 'Moderator', 'Developer', 'VIP', 'Member'].map((roleOpt) => (
              <button
                key={roleOpt}
                type="button"
                onClick={() => setUserRoleFilter(roleOpt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  userRoleFilter === roleOpt
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                }`}
              >
                {roleOpt === 'all' ? 'All Roles' : roleOpt}
              </button>
            ))}
          </div>

          <div className="rounded-3xl glass-panel overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Downloads</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4 text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.map((u) => {
                      const isMasterCreator = u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                      return (
                        <tr key={u.uid} className="hover:bg-slate-50/70">
                          <td className="p-4 flex items-center gap-3">
                            <UserAvatar
                              src={u.photoURL}
                              name={u.displayName}
                              sizeClass="w-8 h-8 text-xs"
                              className="rounded-lg"
                            />
                            <span className="font-bold text-slate-950">{u.displayName}</span>
                          </td>
                          <td className="p-4 text-slate-500 font-mono text-[11px]">{u.email}</td>
                          <td className="p-4 font-mono text-slate-800">{u.downloadsCount || 0}</td>
                          <td className="p-4 text-slate-500">
                            {new Date(u.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            {isMasterCreator ? (
                              <RoleBadge role="Creator" size="xs" />
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <RoleBadge role={u.role} size="xs" />
                                <select
                                  value={u.role}
                                  onChange={async (e) => {
                                    const nextRole = e.target.value as UserProfile['role'];
                                    await updateUserRole(u.uid, nextRole);
                                    showToast(`Updated ${u.displayName}'s role to ${nextRole}.`, 'success');
                                  }}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg px-2 py-1 font-semibold focus:outline-none focus:border-blue-500"
                                >
                                  <option value="Member">Member</option>
                                  <option value="VIP">VIP</option>
                                  <option value="Developer">Developer</option>
                                  <option value="Moderator">Moderator</option>
                                </select>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: REAL ANALYTICS */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl glass-panel">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Visits</span>
              <div className="font-display text-3xl font-black text-emerald-600 font-mono mt-2">
                {siteVisits.toLocaleString()}
              </div>
            </div>
            <div className="p-5 rounded-3xl glass-panel">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Downloads</span>
              <div className="font-display text-3xl font-black text-blue-600 font-mono mt-2">
                {totalDownloads.toLocaleString()}
              </div>
            </div>
            <div className="p-5 rounded-3xl glass-panel">
              <span className="text-xs text-slate-500 font-bold uppercase">Registered Users</span>
              <div className="font-display text-3xl font-black text-pink-600 font-mono mt-2">
                {usersList.length.toLocaleString()}
              </div>
            </div>
            <div className="p-5 rounded-3xl glass-panel">
              <span className="text-xs text-slate-500 font-bold uppercase">Forum Threads</span>
              <div className="font-display text-3xl font-black text-orange-500 font-mono mt-2">
                {discussions.length.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-950">Top Downloaded Resources</h3>
            {topResources.length === 0 ? (
              <p className="text-xs text-slate-500">No resources published yet.</p>
            ) : (
              <div className="space-y-3">
                {topResources.map((r) => {
                  const pct = Math.round(((r.downloadsCount || 0) / maxDl) * 100);
                  return (
                    <div key={r.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-950">{r.title}</span>
                        <span className="font-mono font-semibold text-blue-600 tabular-nums">
                          {(r.downloadsCount || 0).toLocaleString()} downloads
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Breakdown & Top Starred Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="font-display text-sm font-bold text-slate-950">
                Downloads by Category
              </h3>
              {resources.length === 0 ? (
                <p className="text-xs text-slate-500">No resource data yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(
                    resources.reduce<Record<string, { count: number; downloads: number }>>((acc, r) => {
                      const k = r.category || 'other';
                      if (!acc[k]) acc[k] = { count: 0, downloads: 0 };
                      acc[k].count += 1;
                      acc[k].downloads += r.downloadsCount || 0;
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => b[1].downloads - a[1].downloads)
                    .map(([cat, stat]) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-b-0"
                      >
                        <span className="font-bold uppercase text-slate-800">{cat}</span>
                        <span className="font-mono text-slate-600 tabular-nums">
                          {stat.count} builds · <strong className="text-blue-600">{stat.downloads.toLocaleString()}</strong> dl
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="font-display text-sm font-bold text-slate-950">
                Top Starred Projects
              </h3>
              {projects.length === 0 ? (
                <p className="text-xs text-slate-500">No projects published yet.</p>
              ) : (
                <div className="space-y-3">
                  {[...projects]
                    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
                    .slice(0, 5)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-slate-900 truncate">{p.title}</p>
                          <p className="text-[11px] text-slate-500">{p.category} · {p.status}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-orange-600 tabular-nums shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {p.stars || 0}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
