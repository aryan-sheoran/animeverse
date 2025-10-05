'use client';

import { useEffect, useState } from 'react';
import { authClient } from './auth-client';

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional profile fields
  username?: string;
  bio?: string;
  location?: string;
  favoriteAnime?: string;
}

export interface Session {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
  user: User;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      const sessionData = await authClient.getSession();
      
      if (sessionData.data) {
        setSession(sessionData.data as Session);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      setSession(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading,
    logout,
    refreshSession: checkSession,
  };
}
