'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getCurrentUserData, getUserOrganization } from '@/lib/firebase/auth';
import { User as AppUser, Organization } from '@/lib/types/user';

interface AuthContextType {
  user: User | null;
  userData: AppUser | null;
  organization: Organization | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  organization: null,
  loading: true,
  error: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      try {
        setError(null);
        
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Fetch user data
          const appUserData = await getCurrentUserData(firebaseUser.uid);
          setUserData(appUserData);
          
          // Fetch organization data
          if (appUserData?.organizationId) {
            const orgData = await getUserOrganization(appUserData.organizationId);
            setOrganization(orgData);
          }
        } else {
          setUser(null);
          setUserData(null);
          setOrganization(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    organization,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
