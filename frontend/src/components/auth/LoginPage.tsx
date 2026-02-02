// =============================================================================
// PhotoEnglish - Login Page
// =============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage as LoginPageUI } from '@/sections/foundation/LoginPage';
import type { LoginFormData } from '@/sections/foundation/types';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string>();

  const handleLogin = async (data: LoginFormData) => {
    setIsLoggingIn(true);
    setError(undefined);

    try {
      await login(data.emailOrPhone, data.password, data.keepLoggedIn);

      // Refresh user data from server to get latest state
      await refreshUser();

      // Check navigation logic will be handled by AuthContext's user state
      // For now, navigate to onboarding first (it will redirect if already completed)
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请检查您的账号和密码');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <LoginPageUI
      isLoggingIn={isLoggingIn}
      error={error}
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
      onGoToRegister={handleGoToRegister}
    />
  );
}
