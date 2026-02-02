// =============================================================================
// PhotoEnglish - Forgot Password Page
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import type { ResetPasswordFormData } from '@/sections/foundation/types';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

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
    setSuccess(undefined);

    try {
      const response = await authApi.sendVerificationCode(emailOrPhone.trim());

      if (response.success) {
        setSuccess('验证码已发送');
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

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsResetting(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      const response = await authApi.resetPassword({
        emailOrPhone: data.emailOrPhone,
        verificationCode: data.verificationCode,
        newPassword: data.newPassword,
      });

      if (response.success) {
        setSuccess('密码重置成功！请使用新密码登录');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.error || '重置密码失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置密码失败');
    } finally {
      setIsResetting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo 和标题 */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-4xl">📸</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          重置密码
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          输入注册邮箱或手机号重置密码
        </p>
      </div>

      {/* 重置密码表单卡片 */}
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <ResetPasswordForm
          isResetting={isResetting}
          isSendingCode={isSendingCode}
          codeCountdown={codeCountdown}
          error={error}
          success={success}
          onResetPassword={handleResetPassword}
          onSendVerificationCode={handleSendVerificationCode}
          onGoToLogin={handleGoToLogin}
        />
      </div>
    </div>
  );
}

// Reset Password Form Component
function ResetPasswordForm({
  isResetting,
  isSendingCode,
  codeCountdown,
  error,
  success,
  onResetPassword,
  onSendVerificationCode,
  onGoToLogin,
}: {
  isResetting: boolean;
  isSendingCode: boolean;
  codeCountdown: number;
  error?: string;
  success?: string;
  onResetPassword: (data: ResetPasswordFormData) => void;
  onSendVerificationCode: (emailOrPhone: string) => void;
  onGoToLogin: () => void;
}) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);

    if (!emailOrPhone.trim() || !verificationCode.trim() || !newPassword.trim()) {
      setFormError('请填写所有字段');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormError('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('密码长度至少为 6 位');
      return;
    }

    onResetPassword({
      emailOrPhone: emailOrPhone.trim(),
      verificationCode: verificationCode.trim(),
      newPassword: newPassword.trim(),
      confirmNewPassword: confirmNewPassword.trim(),
    });
  };

  const isFormValid =
    emailOrPhone.trim() !== '' &&
    verificationCode.trim() !== '' &&
    newPassword.trim() !== '' &&
    confirmNewPassword.trim() !== '' &&
    newPassword === confirmNewPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 错误提示 */}
      {(error || formError) && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <span className="text-red-600 dark:text-red-400 text-2xl flex-shrink-0">⚠️</span>
          <p className="text-sm text-red-700 dark:text-red-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            {error || formError}
          </p>
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <span className="text-green-600 dark:text-green-400 text-2xl flex-shrink-0">✅</span>
          <p className="text-sm text-green-700 dark:text-green-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            {success}
          </p>
        </div>
      )}

      {/* 邮箱/手机号输入框 */}
      <div>
        <label htmlFor="emailOrPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          邮箱或手机号
        </label>
        <div className="flex gap-2">
          <input
            id="emailOrPhone"
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="请输入注册邮箱或手机号"
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button
            type="button"
            onClick={() => onSendVerificationCode(emailOrPhone)}
            disabled={isSendingCode || codeCountdown > 0}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-medium rounded-xl transition-colors whitespace-nowrap"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isSendingCode ? '发送中...' : codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码'}
          </button>
        </div>
      </div>

      {/* 验证码输入框 */}
      <div>
        <label htmlFor="verificationCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          验证码
        </label>
        <input
          id="verificationCode"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="请输入6位验证码"
          maxLength={6}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          开发模式：任意 6 位数字均可
        </p>
      </div>

      {/* 新密码输入框 */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          新密码
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="请输入新密码（至少6位）"
            className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      {/* 确认新密码输入框 */}
      <div>
        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          确认新密码
        </label>
        <input
          id="confirmNewPassword"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="请再次输入新密码"
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      {/* 重置密码按钮 */}
      <button
        type="submit"
        disabled={!isFormValid || isResetting}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {isResetting ? '重置中...' : '重置密码'}
      </button>

      {/* 返回登录链接 */}
      <p className="text-center text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
        已想起密码？{' '}
        <button
          type="button"
          onClick={onGoToLogin}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
        >
          返回登录
        </button>
      </p>
    </form>
  );
}
