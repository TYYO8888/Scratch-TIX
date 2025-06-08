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
    // For demo purposes, simulate a logged-in user in development
    const demoMode = process.env.NODE_ENV === 'development';

    if (demoMode) {
      // Create mock user data for demo
      const mockUser = {
        uid: 'demo_user_123',
        email: 'demo@scratchtix.com',
        displayName: 'Demo User',
        photoURL: '/api/placeholder/40/40',
      } as any;

      const mockUserData = {
        id: 'demo_user_123',
        email: 'demo@scratchtix.com',
        name: 'Demo User',
        avatar: '/api/placeholder/40/40',
        role: 'admin' as const,
        organizationId: 'org_1',
        permissions: ['read', 'write', 'admin'] as const,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: new Date().toISOString(),
      };

      const mockOrganization = {
        id: 'org_1',
        name: 'Demo Organization',
        plan: 'enterprise' as const,
        features: {
          campaigns: true,
          analytics: true,
          integrations: true,
          whiteLabel: true,
          api: true,
        },
        limits: {
          campaigns: 100,
          participants: 100000,
          apiCalls: 10000,
        },
        usage: {
          campaigns: 12,
          participants: 15847,
          apiCalls: 2341,
        },
      };

      setUser(mockUser);
      setUserData(mockUserData);
      setOrganization(mockOrganization);
      setLoading(false);
      return;
    }

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
