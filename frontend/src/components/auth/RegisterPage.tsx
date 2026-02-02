// =============================================================================
// PhotoEnglish - Register Page
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { RegisterPage as RegisterPageUI } from '@/sections/foundation/RegisterPage';
import type { RegisterFormData } from '@/sections/foundation/types';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [error, setError] = useState<string>();

  // Countdown timer for verification code
  useEffect(() => {
    if (codeCountdown > 0) {
      const timer = setTimeout(() => setCodeCountdown(codeCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeCountdown]);

  const handleSendVerificationCode = async (emailOrPhone: string) => {
    if (!emailOrPhone.trim()) {
      setError('请先输入邮箱或手机号');
      return;
    }

    setIsSendingCode(true);
    setError(undefined);

    try {
      const response = await authApi.sendVerificationCode(emailOrPhone.trim());

      if (response.success) {
        // Start countdown
        setCodeCountdown(60);
      } else {
        setError(response.error || '发送验证码失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送验证码失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsRegistering(true);
    setError(undefined);

    try {
      await register(data.emailOrPhone, data.verificationCode, data.password);

      // After successful registration, navigate to onboarding
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <RegisterPageUI
      isRegistering={isRegistering}
      isSendingCode={isSendingCode}
      codeCountdown={codeCountdown}
      error={error}
      onRegister={handleRegister}
      onSendVerificationCode={handleSendVerificationCode}
      onGoToLogin={handleGoToLogin}
    />
  );
}
