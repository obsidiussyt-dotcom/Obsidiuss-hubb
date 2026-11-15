export type ResourceCategory =
  | 'all'
  | 'minecraft'
  | 'android'
  | 'pc-software'
  | 'source-code'
  | 'tutorials'
  | 'dev-tools'
  | string;

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  version: string;
  downloadUrl: string;
  mirrorUrl?: string;
  thumbnailUrl: string;
  fileSize: string;
  downloadsCount: number;
  rating: number;
  ratingCount?: number;
  featured: boolean;
  changelog?: string;
  requirements?: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ResourceRating {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  stars: number;
  review?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  bannerUrl: string;
  demoUrl?: string;
  githubUrl?: string;
  downloadUrl?: string;
  featured: boolean;
  stars: number;
  status: 'Active' | 'Beta' | 'Completed' | 'In Development';
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'Update' | 'Release' | 'Community' | 'Maintenance' | 'Important';
  pinned: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Minecraft' | 'Android' | 'PC Tools' | 'Support' | 'Suggestions';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'Admin' | 'Creator' | 'VIP' | 'Moderator' | 'Member';
  likesCount: number;
  repliesCount: number;
  tags: string[];
  pinned?: boolean;
  locked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'Admin' | 'Creator' | 'VIP' | 'Moderator' | 'Member';
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface DownloadActivityItem {
  resourceId: string;
  resourceTitle: string;
  resourceVersion?: string;
  resourceCategory?: string;
  downloadedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'Creator' | 'Admin' | 'VIP' | 'Moderator' | 'Member';
  bio?: string;
  discordHandle?: string;
  youtubeHandle?: string;
  downloadsCount: number;
  joinedAt: string;
  updatedAt?: string;
  bookmarks: string[];
  downloadActivity?: DownloadActivityItem[];
}

export interface FeedbackMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt?: string;
}

export interface ModerationReport {
  id: string;
  targetType: 'resource' | 'discussion' | 'comment' | 'review';
  targetId: string;
  reason: string;
  details?: string;
  reporterId: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt?: string;
}

export interface SiteAnalytics {
  totalVisits: number;
  updatedAt?: string;
}
