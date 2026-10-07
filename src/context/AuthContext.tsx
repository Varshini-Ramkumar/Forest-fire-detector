import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';
import { fetchUserById, upsertDocument, demoStore } from '../firebase/firestoreService';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isDemoMode: boolean;
  authError: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isFirebaseConfigured);

  // Restore session from localStorage if exists
  useEffect(() => {
    const savedUser = localStorage.getItem('ignis_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.warn('Failed to parse saved user', e);
      }
    }

    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user);
        if (user) {
          try {
            const profile = await fetchUserById(user.uid);
            if (profile) {
              setCurrentUser(profile);
              localStorage.setItem('ignis_current_user', JSON.stringify(profile));
            } else {
              // User exists in auth but not assigned role in firestore
              setCurrentUser(null);
              setAuthError('Your account has not been assigned a valid role. Please contact the administrator.');
            }
          } catch (err: any) {
            setAuthError('Failed to fetch user permissions from database.');
          }
        }
        setIsLoading(false);
      });
      return () => unsub();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Check if demo user credentials match
    if (cleanEmail === 'admin@igniswatch.demo' && pass === 'Admin@123') {
      await loginAsDemo('admin');
      setIsLoading(false);
      return { success: true, role: 'admin' as UserRole };
    }
    if (cleanEmail === 'official@igniswatch.demo' && pass === 'Official@123') {
      await loginAsDemo('official');
      setIsLoading(false);
      return { success: true, role: 'official' as UserRole };
    }

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const profile = await fetchUserById(cred.user.uid);
        if (!profile || !profile.role) {
          const msg = 'Your account has not been assigned a valid role. Please contact the administrator.';
          setAuthError(msg);
          setIsLoading(false);
          return { success: false, error: msg };
        }
        setCurrentUser(profile);
        localStorage.setItem('ignis_current_user', JSON.stringify(profile));
        setIsLoading(false);
        return { success: true, role: profile.role };
      } catch (err: any) {
        let msg = 'Authentication failed. Please verify credentials.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          msg = 'Invalid email or password.';
        } else if (err.code === 'auth/network-request-failed') {
          msg = 'Network connection failure. Check your internet.';
        }
        setAuthError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }
    }

    // In demo mode fallback: check users list
    const foundUser = demoStore.getUsers().find((u) => u.email.toLowerCase() === cleanEmail);
    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem('ignis_current_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return { success: true, role: foundUser.role };
    }

    const errorMsg = 'Invalid email or password. Use demo buttons or credentials.';
    setAuthError(errorMsg);
    setIsLoading(false);
    return { success: false, error: errorMsg };
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    setIsLoading(true);

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        let profile = await fetchUserById(cred.user.uid);
        if (!profile) {
          // New Google User - assign default Official role for prototype demo
          profile = {
            id: cred.user.uid,
            name: cred.user.displayName || 'Forest Official',
            email: cred.user.email || 'google.user@igniswatch.demo',
            role: 'official',
            department: 'Field Operations & Wildlife Watch',
            createdAt: new Date().toISOString(),
            active: true,
            avatar: cred.user.photoURL || undefined,
          };
          await upsertDocument('users', profile);
        }
        setCurrentUser(profile);
        localStorage.setItem('ignis_current_user', JSON.stringify(profile));
        setIsLoading(false);
        return { success: true, role: profile.role };
      } catch (err: any) {
        const msg = String(err?.message || 'Google Sign-In canceled or failed.');
        setAuthError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }
    }

    // Demo Mode Google simulation
    const demoGoogleUser: UserProfile = {
      id: 'demo-google-user',
      name: 'Forest Officer (Google Auth)',
      email: 'officer.google@igniswatch.demo',
      role: 'official',
      department: 'Special Forest Task Force',
      createdAt: new Date().toISOString(),
      active: true,
    };
    setCurrentUser(demoGoogleUser);
    localStorage.setItem('ignis_current_user', JSON.stringify(demoGoogleUser));
    setIsLoading(false);
    return { success: true, role: 'official' as UserRole };
  };

  const loginAsDemo = async (role: UserRole) => {
    setAuthError(null);
    setIsLoading(true);

    let user: UserProfile;
    if (role === 'admin') {
      user = demoStore.getUsers().find((u) => u.email === 'admin@igniswatch.demo') || {
        id: 'user-admin-1',
        name: 'Dr. Suresh Kumar, IFS',
        email: 'admin@igniswatch.demo',
        role: 'admin',
        department: 'State Forest HQ - Command & IT',
        phone: '+91 98401 23456',
        createdAt: '2025-01-15T08:30:00Z',
        active: true,
      };
    } else {
      user = demoStore.getUsers().find((u) => u.email === 'official@igniswatch.demo') || {
        id: 'user-official-1',
        name: 'Range Officer Rajesh Sharma',
        email: 'official@igniswatch.demo',
        role: 'official',
        department: 'Northern Wildlife Division',
        phone: '+91 94432 98765',
        createdAt: '2025-02-01T10:00:00Z',
        active: true,
      };
    }

    setCurrentUser(user);
    localStorage.setItem('ignis_current_user', JSON.stringify(user));
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    setCurrentUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('ignis_current_user');
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isLoading,
        isDemoMode,
        authError,
        loginWithEmail,
        loginWithGoogle,
        loginAsDemo,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
