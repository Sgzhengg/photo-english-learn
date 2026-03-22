// =============================================================================
// PhotoEnglish - Authentication Context (Anonymous Device ID Login)
// =============================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import { authApi } from '@/lib/api';
import { getOrCreateDeviceId } from '@/lib/device-id';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  anonymousLogin: () => Promise<void>;
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

  // Auto anonymous login on mount
  useEffect(() => {
    const autoLogin = async () => {
      const token = localStorage.getItem('access_token');

      if (token) {
        // Verify existing token
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Clear invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('expires_at');
        }
      }

      // No valid token, perform anonymous login
      try {
        const deviceId = getOrCreateDeviceId();
        const response = await authApi.anonymousLogin(deviceId);

        if (response.success && response.data) {
          const { access_token, user: userData } = response.data as any;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', access_token);
          setUser(userData);
          console.log('✅ [Auth] Anonymous login successful:', userData?.username);
        }
      } catch (error) {
        console.error('❌ [Auth] Anonymous login failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    autoLogin();
  }, []);

  const login = async (emailOrPhone: string, password: string, keepLoggedIn = false) => {
    console.log('🔐 [Auth] Login attempt:', { emailOrPhone, keepLoggedIn });

    const response = await authApi.login(emailOrPhone, password, keepLoggedIn);

    console.log('📥 [Auth] Login response received');
    console.log('   - success:', response.success);
    console.log('   - has data:', !!response.data);
    console.log('   - error:', response.error);
    console.log('   - full response:', JSON.stringify(response, null, 2));

    if (!response.success || !response.data) {
      const errorMsg = Array.isArray(response.error)
        ? response.error.join(', ')
        : (response as any).error || 'Login failed';

      console.error('❌ [Auth] Login failed:', errorMsg);
      throw new Error(errorMsg);
    }

    // Type assertion to handle backend response format
    const data = response.data as any;
    const { access_token, user: userData } = data;

    console.log('✅ [Auth] Login successful, user:', userData?.username || userData?.nickname);

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
    console.log('[Auth] 刷新用户数据');
    const response = await authApi.getCurrentUser();

    console.log('[Auth] 刷新响应:', response);
    if (response.success && response.data) {
      console.log('[Auth] 刷新成功，用户数据:', response.data);
      console.log('[Auth] avatar_url:', response.data.avatar_url);
      setUser(response.data);
    } else {
      console.error('[Auth] 刷新失败:', response.error);
      throw new Error(response.error || 'Failed to refresh user data');
    }
  };

  const anonymousLogin = async () => {
    const deviceId = getOrCreateDeviceId();
    const response = await authApi.anonymousLogin(deviceId);

    if (!response.success || !response.data) {
      const errorMsg = response.error || 'Anonymous login failed';
      console.error('❌ [Auth] Anonymous login failed:', errorMsg);
      throw new Error(errorMsg);
    }

    const data = response.data as any;
    const { access_token, user: userData } = data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', access_token);
    setUser(userData);

    console.log('✅ [Auth] Anonymous login successful:', userData?.username);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    anonymousLogin,
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
