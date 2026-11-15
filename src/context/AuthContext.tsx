import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, DownloadActivityItem } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  toggleBookmark: (resourceId: string) => Promise<boolean>;
  recordDownload: (resourceId: string, resourceMeta?: { title: string; version?: string; category?: string }) => Promise<void>;
  downloadHistory: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = 'obsidiussyt@gmail.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasAdminDoc, setHasAdminDoc] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadHistory, setDownloadHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('obsidiuss_downloads');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isMainAdmin =
          currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
          (currentUser.emailVerified ||
            currentUser.providerData.some((p) => p.providerId === 'google.com'));

        try {
          // Check /admins/{uid} doc in case additional admin is registered
          try {
            const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
            setHasAdminDoc(adminSnap.exists());
          } catch {
            setHasAdminDoc(false);
          }

          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            if (isMainAdmin && data.role !== 'Creator') {
              data.role = 'Creator';
              await setDoc(
                userDocRef,
                { role: 'Creator', updatedAt: new Date().toISOString() },
                { merge: true }
              );
            }
            setProfile(data);
          } else {
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || (isMainAdmin ? 'Obsidiuss' : 'Community Member'),
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              role: isMainAdmin ? 'Creator' : 'Member',
              bio: isMainAdmin ? 'Creator & Developer of OBSIDIUSS HUB.' : '',
              discordHandle: '',
              youtubeHandle: isMainAdmin ? '@obsidiuss' : '',
              downloadsCount: 0,
              joinedAt: new Date().toISOString(),
              bookmarks: [],
            };
            await setDoc(userDocRef, initialProfile);
            setProfile(initialProfile);
          }
        } catch (error) {
          console.error('Error syncing user profile from Firestore:', error);
          setProfile({
            uid: currentUser.uid,
            displayName: currentUser.displayName || (isMainAdmin ? 'Obsidiuss' : 'Community Member'),
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            role: isMainAdmin ? 'Creator' : 'Member',
            bio: '',
            downloadsCount: 0,
            joinedAt: new Date().toISOString(),
            bookmarks: [],
          });
        }
      } else {
        setProfile(null);
        setHasAdminDoc(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setProfile(null);
    setUser(null);
    setHasAdminDoc(false);
    await firebaseSignOut(auth);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!profile || !user) return;
    const updated: UserProfile = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (auth.currentUser && (data.displayName || data.photoURL !== undefined)) {
      try {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: data.displayName ?? auth.currentUser.displayName,
          photoURL: data.photoURL ?? auth.currentUser.photoURL,
        });
      } catch (e) {
        console.warn('Could not update Firebase Auth user profile object:', e);
      }
    }

    try {
      await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const toggleBookmark = async (resourceId: string): Promise<boolean> => {
    if (!profile) return false;
    const exists = profile.bookmarks?.includes(resourceId);
    const updatedBookmarks = exists
      ? profile.bookmarks.filter((id) => id !== resourceId)
      : [...(profile.bookmarks || []), resourceId];

    await updateProfileData({ bookmarks: updatedBookmarks });
    return !exists;
  };

  const recordDownload = async (
    resourceId: string,
    resourceMeta?: { title: string; version?: string; category?: string }
  ) => {
    setDownloadHistory((prev) => {
      const next = [resourceId, ...prev.filter((id) => id !== resourceId)].slice(0, 50);
      try {
        localStorage.setItem('obsidiuss_downloads', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });

    if (profile && user) {
      const count = (profile.downloadsCount || 0) + 1;
      const prevActivity = profile.downloadActivity || [];
      const newEntry: DownloadActivityItem = {
        resourceId,
        resourceTitle: resourceMeta?.title || 'Resource Package',
        resourceVersion: resourceMeta?.version || '',
        resourceCategory: resourceMeta?.category || '',
        downloadedAt: new Date().toISOString(),
      };
      const updatedActivity = [
        newEntry,
        ...prevActivity.filter((a) => a.resourceId !== resourceId),
      ].slice(0, 30);

      await updateProfileData({
        downloadsCount: count,
        downloadActivity: updatedActivity,
      });
    }
  };

  const isMainAdmin =
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    (user.emailVerified || user.providerData.some((p) => p.providerId === 'google.com'));

  const isAdmin = Boolean(isMainAdmin || hasAdminDoc);
  const isCreator = Boolean(isMainAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isCreator,
        signInWithGoogle,
        signOut,
        updateProfileData,
        toggleBookmark,
        recordDownload,
        downloadHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
