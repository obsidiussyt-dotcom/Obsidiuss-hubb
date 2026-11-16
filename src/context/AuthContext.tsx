import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, PublicProfile, DownloadActivityItem } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  isVerifiedUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshAuthUser: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  toggleBookmark: (resourceId: string) => Promise<boolean>;
  recordDownload: (
    resourceId: string,
    resourceMeta?: { title: string; version?: string; category?: string }
  ) => Promise<void>;
  downloadHistory: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = 'obsidiussyt@gmail.com';

async function syncPublicProfileDoc(profile: UserProfile) {
  const publicPayload: PublicProfile = {
    uid: profile.uid,
    displayName: profile.displayName || 'Community Member',
    photoURL: profile.photoURL || '',
    role: profile.role || 'Member',
    bio: profile.bio || '',
    discordHandle: profile.discordHandle || '',
    youtubeHandle: profile.youtubeHandle || '',
    updatedAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'publicProfiles', profile.uid), publicPayload, { merge: true });
  } catch (err) {
    console.warn('Public profile sync warning:', err);
  }
}

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
          currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
            syncPublicProfileDoc(data);
          } else {
            const fallbackName =
              currentUser.displayName ||
              currentUser.email?.split('@')[0] ||
              (isMainAdmin ? 'Obsidiuss' : 'Community Member');
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: fallbackName.slice(0, 80),
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              role: isMainAdmin ? 'Creator' : 'Member',
              bio: isMainAdmin ? 'Owner & Creator of OBSIDIUSS HUB — Bhaskar Yadav (Obsidiuss).' : '',
              discordHandle: '',
              youtubeHandle: isMainAdmin ? '@obsidiuss' : '',
              downloadsCount: 0,
              joinedAt: new Date().toISOString(),
              bookmarks: [],
            };
            await setDoc(userDocRef, initialProfile);
            setProfile(initialProfile);
            syncPublicProfileDoc(initialProfile);
          }
        } catch (error) {
          console.error('Error syncing user profile from Firestore:', error);
          setProfile({
            uid: currentUser.uid,
            displayName:
              currentUser.displayName ||
              currentUser.email?.split('@')[0] ||
              (isMainAdmin ? 'Obsidiuss' : 'Community Member'),
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

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      console.error('Email Sign In Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const cleanName = displayName.trim().slice(0, 80) || email.split('@')[0];
      await firebaseUpdateProfile(cred.user, { displayName: cleanName });
      try {
        await sendEmailVerification(cred.user);
      } catch (verifyErr) {
        console.warn('Could not dispatch initial verification email:', verifyErr);
      }
      const userDocRef = doc(db, 'users', cred.user.uid);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        displayName: cleanName,
        email: cred.user.email || email.trim(),
        photoURL: '',
        role: 'Member',
        bio: '',
        discordHandle: '',
        youtubeHandle: '',
        downloadsCount: 0,
        joinedAt: new Date().toISOString(),
        bookmarks: [],
      };
      await setDoc(userDocRef, newProfile, { merge: true });
      await syncPublicProfileDoc(newProfile);
      setProfile(newProfile);
    } catch (err) {
      console.error('Email Sign Up Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('Not signed in.');
    await sendEmailVerification(auth.currentUser);
  };

  const refreshAuthUser = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const updatedUser = auth.currentUser;
    setUser({ ...updatedUser } as FirebaseUser);
    return Boolean(
      updatedUser.emailVerified ||
        updatedUser.providerData.some((p) => p.providerId === 'google.com')
    );
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
          photoURL: data.photoURL && data.photoURL.startsWith('http') ? data.photoURL : auth.currentUser.photoURL,
        });
      } catch (e) {
        console.warn('Could not update Firebase Auth user profile object:', e);
      }
    }

    try {
      await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
      await syncPublicProfileDoc(updated);
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

  const isVerifiedUser = Boolean(user);

  const isMainAdmin =
    Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

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
        isVerifiedUser,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        resendVerificationEmail,
        refreshAuthUser,
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
