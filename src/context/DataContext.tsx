import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import {
  Resource,
  ResourceRating,
  Project,
  Announcement,
  Discussion,
  Comment,
  CategoryItem,
  UserProfile,
  FeedbackMessage,
  ModerationReport,
} from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  resources: Resource[];
  projects: Project[];
  announcements: Announcement[];
  discussions: Discussion[];
  categories: CategoryItem[];
  siteVisits: number;
  loading: boolean;

  // Admin-only collections
  usersList: UserProfile[];
  feedbackList: FeedbackMessage[];
  reportsList: ModerationReport[];

  // Per-user interaction state
  likedDiscussionIds: Set<string>;
  starredProjectIds: Set<string>;

  // Resource operations
  addResource: (data: Omit<Resource, 'id' | 'createdAt' | 'downloadsCount' | 'rating' | 'ratingCount'>) => Promise<void>;
  updateResource: (id: string, data: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  incrementDownload: (id: string) => Promise<void>;
  getResourceRatings: (resourceId: string, callback: (ratings: ResourceRating[]) => void) => () => void;
  rateResource: (resourceId: string, stars: number, review?: string) => Promise<void>;
  deleteResourceRating: (resourceId: string, ratingUserId: string) => Promise<void>;
  getAllResourceRatings: () => Promise<(ResourceRating & { resourceTitle: string })[]>;
  getUserActivityComments: (userId: string) => Promise<{ comment: Comment; discussionTitle: string }[]>;
  getUserActivityReviews: (userId: string) => Promise<(ResourceRating & { resourceTitle: string })[]>;

  // Project operations
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'stars'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  toggleProjectStar: (projectId: string) => Promise<boolean>;

  // Announcement operations
  addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Category operations
  addCategory: (data: { name: string; slug: string; description?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Discussion & Comment operations
  addDiscussion: (data: { title: string; content: string; category: Discussion['category']; tags: string[] }) => Promise<string>;
  updateDiscussion: (id: string, data: Partial<Discussion>) => Promise<void>;
  toggleDiscussionLike: (id: string) => Promise<boolean>;
  deleteDiscussion: (id: string) => Promise<void>;
  getCommentsForDiscussion: (discussionId: string, callback: (comments: Comment[]) => void) => () => void;
  addComment: (discussionId: string, content: string) => Promise<void>;
  deleteComment: (discussionId: string, commentId: string) => Promise<void>;

  // Feedback & Moderation Reports
  submitFeedback: (data: { name: string; email: string; subject: string; message: string }) => Promise<void>;
  updateFeedbackStatus: (id: string, status: FeedbackMessage['status']) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  submitReport: (data: { targetType: 'resource' | 'discussion' | 'comment' | 'review'; targetId: string; reason: string; details?: string }) => Promise<void>;
  updateReportStatus: (id: string, status: ModerationReport['status']) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;

  // User Role management (Admin)
  updateUserRole: (uid: string, role: UserProfile['role']) => Promise<void>;

  // File Upload (Firebase Storage)
  uploadFile: (file: File, folder: string) => Promise<string>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin } = useAuth();

  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteVisits, setSiteVisits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackMessage[]>([]);
  const [reportsList, setReportsList] = useState<ModerationReport[]>([]);

  const [likedDiscussionIds, setLikedDiscussionIds] = useState<Set<string>>(new Set());
  const [starredProjectIds, setStarredProjectIds] = useState<Set<string>>(new Set());

  // Record 1 real site visit per browser session
  useEffect(() => {
    const trackVisit = async () => {
      try {
        if (sessionStorage.getItem('obsidiuss_visit_tracked')) return;
        sessionStorage.setItem('obsidiuss_visit_tracked', '1');

        const siteRef = doc(db, 'analytics', 'site');
        const snap = await getDoc(siteRef);
        const now = new Date().toISOString();

        if (snap.exists()) {
          await updateDoc(siteRef, {
            totalVisits: increment(1),
            updatedAt: now,
          });
        } else {
          await setDoc(siteRef, {
            totalVisits: 1,
            updatedAt: now,
          });
        }
      } catch (err) {
        console.warn('Could not record site visit:', err);
      }
    };
    trackVisit();
  }, []);

  // Subscribe to all public Firestore collections (Zero fake fallbacks)
  useEffect(() => {
    let resolvedCount = 0;
    const markResolved = () => {
      resolvedCount += 1;
      if (resolvedCount >= 4) {
        setLoading(false);
      }
    };

    const unsubResources = onSnapshot(
      query(collection(db, 'resources'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: Resource[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Resource),
          id: docSnap.id,
        }));
        setResources(list);
        markResolved();
      },
      (err) => {
        markResolved();
        handleFirestoreError(err, OperationType.LIST, 'resources');
      }
    );

    const unsubProjects = onSnapshot(
      query(collection(db, 'projects'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: Project[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Project),
          id: docSnap.id,
        }));
        setProjects(list);
        markResolved();
      },
      (err) => {
        markResolved();
        handleFirestoreError(err, OperationType.LIST, 'projects');
      }
    );

    const unsubAnnouncements = onSnapshot(
      query(collection(db, 'announcements'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: Announcement[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Announcement),
          id: docSnap.id,
        }));
        setAnnouncements(list);
        markResolved();
      },
      (err) => {
        markResolved();
        handleFirestoreError(err, OperationType.LIST, 'announcements');
      }
    );

    const unsubDiscussions = onSnapshot(
      query(collection(db, 'discussions'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: Discussion[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Discussion),
          id: docSnap.id,
        }));
        setDiscussions(list);
        markResolved();
      },
      (err) => {
        markResolved();
        handleFirestoreError(err, OperationType.LIST, 'discussions');
      }
    );

    const unsubCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('createdAt', 'asc')),
      (snapshot) => {
        const list: CategoryItem[] = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as CategoryItem),
          id: docSnap.id,
        }));
        setCategories(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'categories');
      }
    );

    const unsubAnalytics = onSnapshot(
      doc(db, 'analytics', 'site'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSiteVisits(typeof data.totalVisits === 'number' ? data.totalVisits : 0);
        } else {
          setSiteVisits(0);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'analytics/site');
      }
    );

    return () => {
      unsubResources();
      unsubProjects();
      unsubAnnouncements();
      unsubDiscussions();
      unsubCategories();
      unsubAnalytics();
    };
  }, []);

  // Admin-only listeners (Users, Feedback, Moderation Reports)
  useEffect(() => {
    if (!isAdmin) {
      setUsersList([]);
      setFeedbackList([]);
      setReportsList([]);
      return;
    }

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list: UserProfile[] = snapshot.docs.map((d) => ({
          ...(d.data() as UserProfile),
          uid: d.id,
        }));
        setUsersList(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'users');
      }
    );

    const unsubFeedback = onSnapshot(
      query(collection(db, 'feedback'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: FeedbackMessage[] = snapshot.docs.map((d) => ({
          ...(d.data() as FeedbackMessage),
          id: d.id,
        }));
        setFeedbackList(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'feedback');
      }
    );

    const unsubReports = onSnapshot(
      query(collection(db, 'reports'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: ModerationReport[] = snapshot.docs.map((d) => ({
          ...(d.data() as ModerationReport),
          id: d.id,
        }));
        setReportsList(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'reports');
      }
    );

    return () => {
      unsubUsers();
      unsubFeedback();
      unsubReports();
    };
  }, [isAdmin]);

  // Load current user's liked discussions & starred projects
  useEffect(() => {
    if (!user) {
      setLikedDiscussionIds(new Set());
      setStarredProjectIds(new Set());
      return;
    }

    let cancelled = false;

    const loadUserInteractions = async () => {
      try {
        const likedSet = new Set<string>();
        await Promise.all(
          discussions.map(async (disc) => {
            const snap = await getDoc(doc(db, 'discussions', disc.id, 'likes', user.uid));
            if (snap.exists()) likedSet.add(disc.id);
          })
        );
        if (!cancelled) setLikedDiscussionIds(likedSet);

        const starredSet = new Set<string>();
        await Promise.all(
          projects.map(async (proj) => {
            const snap = await getDoc(doc(db, 'projects', proj.id, 'stars', user.uid));
            if (snap.exists()) starredSet.add(proj.id);
          })
        );
        if (!cancelled) setStarredProjectIds(starredSet);
      } catch {
        // Ignore non-critical hydration failure
      }
    };

    loadUserInteractions();
    return () => {
      cancelled = true;
    };
  }, [user, discussions.length, projects.length]);

  // --- Resource Operations ---
  const addResource = async (
    data: Omit<Resource, 'id' | 'createdAt' | 'downloadsCount' | 'rating' | 'ratingCount'>
  ) => {
    const id = generateId('res');
    const newResource: Resource = {
      ...data,
      id,
      downloadsCount: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString(),
    };
    // Remove undefined fields for Firestore cleanliness
    const cleanPayload = Object.fromEntries(
      Object.entries(newResource).filter(([, v]) => v !== undefined)
    );

    try {
      await setDoc(doc(db, 'resources', id), cleanPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `resources/${id}`);
    }
  };

  const updateResource = async (id: string, data: Partial<Resource>) => {
    const cleanPayload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(([, v]) => v !== undefined)
    );
    try {
      await updateDoc(doc(db, 'resources', id), cleanPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `resources/${id}`);
    }
  };

  const deleteResource = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'resources', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `resources/${id}`);
    }
  };

  const incrementDownload = async (id: string) => {
    try {
      await updateDoc(doc(db, 'resources', id), {
        downloadsCount: increment(1),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `resources/${id}`);
    }
  };

  const getResourceRatings = useCallback(
    (resourceId: string, callback: (ratings: ResourceRating[]) => void) => {
      const q = query(collection(db, 'resources', resourceId, 'ratings'), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snap) => {
          const list: ResourceRating[] = snap.docs.map((d) => ({
            ...(d.data() as ResourceRating),
            id: d.id,
          }));
          callback(list);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, `resources/${resourceId}/ratings`);
        }
      );
    },
    []
  );

  const rateResource = async (resourceId: string, stars: number, review?: string) => {
    if (!user || !profile) {
      throw new Error('Authentication required to rate resources.');
    }

    const clampedStars = Math.max(1, Math.min(5, Math.round(stars)));
    const ratingRef = doc(db, 'resources', resourceId, 'ratings', user.uid);
    const now = new Date().toISOString();
    const existingSnap = await getDoc(ratingRef);

    const payload: Record<string, unknown> = {
      resourceId,
      userId: user.uid,
      userName: profile.displayName,
      stars: clampedStars,
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : now,
      updatedAt: now,
    };
    if (profile.photoURL) {
      payload.userAvatar = profile.photoURL;
    }
    if (review && review.trim()) {
      payload.review = review.trim().slice(0, 500);
    }

    try {
      await setDoc(ratingRef, payload);

      // Recompute real average rating from all ratings in subcollection
      const ratingsSnap = await getDocs(collection(db, 'resources', resourceId, 'ratings'));
      const total = ratingsSnap.docs.reduce((sum, d) => sum + Number(d.data().stars || 0), 0);
      const count = ratingsSnap.size;
      const avg = count > 0 ? Number((total / count).toFixed(2)) : 0;

      await updateDoc(doc(db, 'resources', resourceId), {
        rating: avg,
        ratingCount: count,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `resources/${resourceId}/ratings/${user.uid}`);
    }
  };

  const deleteResourceRating = async (resourceId: string, ratingUserId: string) => {
    if (!user) throw new Error('Authentication required.');
    if (!isAdmin && user.uid !== ratingUserId) {
      throw new Error('Not authorized to delete this review.');
    }

    try {
      await deleteDoc(doc(db, 'resources', resourceId, 'ratings', ratingUserId));

      // Recompute average
      const ratingsSnap = await getDocs(collection(db, 'resources', resourceId, 'ratings'));
      const total = ratingsSnap.docs.reduce((sum, d) => sum + Number(d.data().stars || 0), 0);
      const count = ratingsSnap.size;
      const avg = count > 0 ? Number((total / count).toFixed(2)) : 0;

      await updateDoc(doc(db, 'resources', resourceId), {
        rating: avg,
        ratingCount: count,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `resources/${resourceId}/ratings/${ratingUserId}`);
    }
  };

  const getAllResourceRatings = useCallback(async (): Promise<(ResourceRating & { resourceTitle: string })[]> => {
    const allRatings: (ResourceRating & { resourceTitle: string })[] = [];
    await Promise.all(
      resources.map(async (res) => {
        try {
          const snap = await getDocs(collection(db, 'resources', res.id, 'ratings'));
          snap.docs.forEach((d) => {
            allRatings.push({
              ...(d.data() as ResourceRating),
              id: d.id,
              resourceTitle: res.title,
            });
          });
        } catch {
          // ignore single resource fetch error
        }
      })
    );
    return allRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [resources]);

  const getUserActivityComments = useCallback(async (userId: string): Promise<{ comment: Comment; discussionTitle: string }[]> => {
    const userComments: { comment: Comment; discussionTitle: string }[] = [];
    await Promise.all(
      discussions.map(async (disc) => {
        try {
          const snap = await getDocs(collection(db, 'discussions', disc.id, 'comments'));
          snap.docs.forEach((d) => {
            const data = d.data() as Comment;
            if (data.authorId === userId) {
              userComments.push({
                comment: { ...data, id: d.id },
                discussionTitle: disc.title,
              });
            }
          });
        } catch {
          // ignore
        }
      })
    );
    return userComments.sort(
      (a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime()
    );
  }, [discussions]);

  const getUserActivityReviews = useCallback(async (userId: string): Promise<(ResourceRating & { resourceTitle: string })[]> => {
    const userReviews: (ResourceRating & { resourceTitle: string })[] = [];
    await Promise.all(
      resources.map(async (res) => {
        try {
          const snap = await getDoc(doc(db, 'resources', res.id, 'ratings', userId));
          if (snap.exists()) {
            userReviews.push({
              ...(snap.data() as ResourceRating),
              id: snap.id,
              resourceTitle: res.title,
            });
          }
        } catch {
          // ignore
        }
      })
    );
    return userReviews.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [resources]);

  // --- Project Operations ---
  const addProject = async (data: Omit<Project, 'id' | 'createdAt' | 'stars'>) => {
    const id = generateId('proj');
    const payload = Object.fromEntries(
      Object.entries({
        ...data,
        id,
        stars: 0,
        createdAt: new Date().toISOString(),
      }).filter(([, v]) => v !== undefined)
    );

    try {
      await setDoc(doc(db, 'projects', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `projects/${id}`);
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(([, v]) => v !== undefined)
    );
    try {
      await updateDoc(doc(db, 'projects', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${id}`);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
  };

  const toggleProjectStar = async (projectId: string): Promise<boolean> => {
    if (!user) throw new Error('Sign in required to star projects.');
    const starRef = doc(db, 'projects', projectId, 'stars', user.uid);
    const projectRef = doc(db, 'projects', projectId);

    try {
      const snap = await getDoc(starRef);
      if (snap.exists()) {
        await deleteDoc(starRef);
        await updateDoc(projectRef, { stars: increment(-1) });
        setStarredProjectIds((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
        return false;
      } else {
        await setDoc(starRef, { userId: user.uid, createdAt: new Date().toISOString() });
        await updateDoc(projectRef, { stars: increment(1) });
        setStarredProjectIds((prev) => new Set(prev).add(projectId));
        return true;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `projects/${projectId}/stars/${user.uid}`);
    }
  };

  // --- Announcement Operations ---
  const addAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>) => {
    const id = generateId('ann');
    const payload = Object.fromEntries(
      Object.entries({
        ...data,
        id,
        createdAt: new Date().toISOString(),
      }).filter(([, v]) => v !== undefined)
    );
    try {
      await setDoc(doc(db, 'announcements', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `announcements/${id}`);
    }
  };

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(([, v]) => v !== undefined)
    );
    try {
      await updateDoc(doc(db, 'announcements', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `announcements/${id}`);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
    }
  };

  // --- Category Operations ---
  const addCategory = async (data: { name: string; slug: string; description?: string }) => {
    const cleanSlug = data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!cleanSlug) throw new Error('Invalid category slug.');

    const payload: CategoryItem = {
      id: cleanSlug,
      slug: cleanSlug,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'categories', cleanSlug), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${cleanSlug}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  // --- Discussion & Comment Operations ---
  const addDiscussion = async (data: {
    title: string;
    content: string;
    category: Discussion['category'];
    tags: string[];
  }): Promise<string> => {
    if (!user || !profile) {
      throw new Error('Authentication required to create discussions.');
    }
    const id = generateId('disc');
    const newDisc: Discussion = {
      id,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags,
      authorId: user.uid,
      authorName: profile.displayName,
      authorAvatar: profile.photoURL || '',
      authorRole: profile.role || 'Member',
      likesCount: 0,
      repliesCount: 0,
      pinned: false,
      locked: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'discussions', id), newDisc);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `discussions/${id}`);
    }

    return id;
  };

  const updateDiscussion = async (id: string, data: Partial<Discussion>) => {
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(([, v]) => v !== undefined)
    );
    try {
      await updateDoc(doc(db, 'discussions', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `discussions/${id}`);
    }
  };

  const toggleDiscussionLike = async (id: string): Promise<boolean> => {
    if (!user) throw new Error('Sign in required to like discussions.');
    const likeRef = doc(db, 'discussions', id, 'likes', user.uid);
    const discRef = doc(db, 'discussions', id);

    try {
      const snap = await getDoc(likeRef);
      if (snap.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(discRef, { likesCount: increment(-1) });
        setLikedDiscussionIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return false;
      } else {
        await setDoc(likeRef, { userId: user.uid, createdAt: new Date().toISOString() });
        await updateDoc(discRef, { likesCount: increment(1) });
        setLikedDiscussionIds((prev) => new Set(prev).add(id));
        return true;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `discussions/${id}/likes/${user.uid}`);
    }
  };

  const deleteDiscussion = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'discussions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `discussions/${id}`);
    }
  };

  const getCommentsForDiscussion = useCallback(
    (discussionId: string, callback: (comments: Comment[]) => void) => {
      const q = query(
        collection(db, 'discussions', discussionId, 'comments'),
        orderBy('createdAt', 'asc')
      );
      return onSnapshot(
        q,
        (snap) => {
          const list: Comment[] = snap.docs.map((d) => ({
            ...(d.data() as Comment),
            id: d.id,
          }));
          callback(list);
        },
        (err) => {
          callback([]);
          handleFirestoreError(err, OperationType.LIST, `discussions/${discussionId}/comments`);
        }
      );
    },
    []
  );

  const addComment = async (discussionId: string, content: string) => {
    if (!user || !profile) {
      throw new Error('Authentication required to post comments.');
    }
    const id = generateId('cmt');
    const newComment: Comment = {
      id,
      discussionId,
      authorId: user.uid,
      authorName: profile.displayName,
      authorAvatar: profile.photoURL || '',
      authorRole: profile.role || 'Member',
      content,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'discussions', discussionId, 'comments', id), newComment);
      await updateDoc(doc(db, 'discussions', discussionId), {
        repliesCount: increment(1),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `discussions/${discussionId}/comments/${id}`);
    }
  };

  const deleteComment = async (discussionId: string, commentId: string) => {
    try {
      await deleteDoc(doc(db, 'discussions', discussionId, 'comments', commentId));
      const commentsSnap = await getDocs(collection(db, 'discussions', discussionId, 'comments'));
      await updateDoc(doc(db, 'discussions', discussionId), {
        repliesCount: commentsSnap.size,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `discussions/${discussionId}/comments/${commentId}`);
    }
  };

  // --- Feedback & Reports ---
  const submitFeedback = async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    const id = generateId('fb');
    const payload: FeedbackMessage = {
      ...data,
      id,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'feedback', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `feedback/${id}`);
    }
  };

  const updateFeedbackStatus = async (id: string, status: FeedbackMessage['status']) => {
    try {
      await updateDoc(doc(db, 'feedback', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `feedback/${id}`);
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'feedback', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `feedback/${id}`);
    }
  };

  const submitReport = async (data: {
    targetType: 'resource' | 'discussion' | 'comment' | 'review';
    targetId: string;
    reason: string;
    details?: string;
  }) => {
    if (!user) {
      throw new Error('Authentication required to submit reports.');
    }
    const id = generateId('rep');
    const payload = Object.fromEntries(
      Object.entries({
        ...data,
        id,
        reporterId: user.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }).filter(([, v]) => v !== undefined)
    );

    try {
      await setDoc(doc(db, 'reports', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reports/${id}`);
    }
  };

  const updateReportStatus = async (id: string, status: ModerationReport['status']) => {
    try {
      await updateDoc(doc(db, 'reports', id), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${id}`);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${id}`);
    }
  };

  // --- User Role Management (Admin) ---
  const updateUserRole = async (uid: string, role: UserProfile['role']) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  // --- Firebase Storage File Upload ---
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileRef = ref(storage, `${folder}/${Date.now()}_${safeName}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  return (
    <DataContext.Provider
      value={{
        resources,
        projects,
        announcements,
        discussions,
        categories,
        siteVisits,
        loading,
        usersList,
        feedbackList,
        reportsList,
        likedDiscussionIds,
        starredProjectIds,
        addResource,
        updateResource,
        deleteResource,
        incrementDownload,
        getResourceRatings,
        rateResource,
        deleteResourceRating,
        getAllResourceRatings,
        getUserActivityComments,
        getUserActivityReviews,
        addProject,
        updateProject,
        deleteProject,
        toggleProjectStar,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addCategory,
        deleteCategory,
        addDiscussion,
        updateDiscussion,
        toggleDiscussionLike,
        deleteDiscussion,
        getCommentsForDiscussion,
        addComment,
        deleteComment,
        submitFeedback,
        updateFeedbackStatus,
        deleteFeedback,
        submitReport,
        updateReportStatus,
        deleteReport,
        updateUserRole,
        uploadFile,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
