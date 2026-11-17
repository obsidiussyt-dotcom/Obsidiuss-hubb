import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, PublicProfile, DownloadActivityItem } from '../types';

const EMAIL_FOR_SIGNIN_KEY = 'obsidiuss_email_for_signin';
const NAME_FOR_SIGNIN_KEY = 'obsidiuss_name_for_signin';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  isVerifiedUser: boolean;
  pendingEmailLinkPrompt: boolean;
  emailLinkError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  sendEmailOtpLink: (email: string, displayName?: string) => Promise<void>;
  completeEmailOtpLink: (email: string, displayName?: string) => Promise<void>;
  dismissEmailLinkPrompt: () => void;
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
  const [pendingEmailLinkPrompt, setPendingEmailLinkPrompt] = useState<boolean>(false);
  const [emailLinkError, setEmailLinkError] = useState<string | null>(null);
  const [downloadHistory, setDownloadHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('obsidiuss_downloads');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const completeEmailOtpLink = useCallback(async (emailInput: string, displayNameInput?: string) => {
    const cleanEmail = emailInput.trim();
    if (!cleanEmail) throw new Error('Please enter your email address to complete sign-in.');

    setLoading(true);
    setEmailLinkError(null);
    try {
      const cred = await signInWithEmailLink(auth, cleanEmail, window.location.href);
      const savedName =
        displayNameInput?.trim() ||
        window.localStorage.getItem(NAME_FOR_SIGNIN_KEY) ||
        '';

      if (savedName && !cred.user.displayName) {
        try {
          await firebaseUpdateProfile(cred.user, { displayName: savedName.slice(0, 80) });
        } catch (err) {
          console.warn('Could not set initial displayName:', err);
        }
      }

      window.localStorage.removeItem(EMAIL_FOR_SIGNIN_KEY);
      window.localStorage.removeItem(NAME_FOR_SIGNIN_KEY);
      setPendingEmailLinkPrompt(false);

      // Clean Firebase OTP query parameters from the URL
      const cleanPath = window.location.pathname === '/signin' ? '/' : window.location.pathname;
      window.history.replaceState(null, '', cleanPath);
    } catch (err: any) {
      console.error('Email Link Verification Error:', err);
      setEmailLinkError(err?.message || 'The verification link has expired or is invalid.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically detect incoming Firebase Email OTP Sign-In Link
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = window.localStorage.getItem(EMAIL_FOR_SIGNIN_KEY);
      if (savedEmail) {
        completeEmailOtpLink(savedEmail).catch(() => {
          setPendingEmailLinkPrompt(true);
        });
      } else {
        // User opened the OTP link on a different browser/device: prompt for email confirmation
        setPendingEmailLinkPrompt(true);
      }
    }
  }, [completeEmailOtpLink]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const isMainAdmin =
          currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        try {
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
            const storedPendingName =
              typeof window !== 'undefined'
                ? window.localStorage.getItem(NAME_FOR_SIGNIN_KEY)
                : '';
            const fallbackName =
              currentUser.displayName ||
              storedPendingName ||
              currentUser.email?.split('@')[0] ||
              (isMainAdmin ? 'Obsidiuss' : 'Community Member');

            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: fallbackName.slice(0, 80),
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              role: isMainAdmin ? 'Creator' : 'Member',
              bio: isMainAdmin
                ? 'Owner & Creator of OBSIDIUSS HUB — Bhaskar Yadav (Obsidiuss).'
                : '',
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
      const isMainAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const userDocRef = doc(db, 'users', cred.user.uid);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        displayName: cleanName,
        email: cred.user.email || email.trim(),
        photoURL: '',
        role: isMainAdmin ? 'Creator' : 'Member',
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

  const sendEmailOtpLink = async (emailInput: string, displayNameInput?: string) => {
    const cleanEmail = emailInput.trim();
    const actionCodeSettings = {
      url: `${window.location.origin}/signin`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
    window.localStorage.setItem(EMAIL_FOR_SIGNIN_KEY, cleanEmail);
    if (displayNameInput?.trim()) {
      window.localStorage.setItem(NAME_FOR_SIGNIN_KEY, displayNameInput.trim().slice(0, 80));
    }
  };

  const dismissEmailLinkPrompt = () => {
    setPendingEmailLinkPrompt(false);
    setEmailLinkError(null);
    const cleanPath = window.location.pathname === '/signin' ? '/' : window.location.pathname;
    window.history.replaceState(null, '', cleanPath);
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
    return Boolean(updatedUser);
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
          photoURL:
            data.photoURL && data.photoURL.startsWith('http')
              ? data.photoURL
              : auth.currentUser.photoURL,
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

  // Equal permissions whether signed in via Google, Email OTP Link, or Email & Password
  const isVerifiedUser = Boolean(user);

  const isMainAdmin = Boolean(
    user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

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
        pendingEmailLinkPrompt,
        emailLinkError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendEmailOtpLink,
        completeEmailOtpLink,
        dismissEmailLinkPrompt,
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
