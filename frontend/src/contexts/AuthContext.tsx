// =============================================================================
// PhotoEnglish - Authentication Context
// =============================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string, keepLoggedIn?: boolean) => Promise<void>;
  register: (emailOrPhone: string, verificationCode: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('expires_at');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (emailOrPhone: string, password: string, keepLoggedIn = false) => {
    const response = await authApi.login(emailOrPhone, password, keepLoggedIn);

    if (!response.success || !response.data) {
      throw new Error((response as any).error || 'Login failed');
    }

    // Type assertion to handle backend response format
    const data = response.data as any;
    const { access_token, user: userData } = data;

    // Store tokens (backend uses access_token, not refreshToken)
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', access_token); // Use access_token as refresh_token for now

    setUser(userData);
  };

  const register = async (emailOrPhone: string, verificationCode: string, password: string) => {
    const response = await authApi.register({ emailOrPhone, verificationCode, password });

    if (!response.success || !response.data) {
      throw new Error((response as any).error || 'Registration failed');
    }

    // Type assertion to handle backend response format
    const data = response.data as any;
    const { access_token, user: userData } = data;

    // Store tokens (backend uses access_token, not refreshToken)
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', access_token); // Use access_token as refresh_token for now

    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const response = await authApi.getCurrentUser();

    if (response.success && response.data) {
      setUser(response.data);
    } else {
      throw new Error(response.error || 'Failed to refresh user data');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
