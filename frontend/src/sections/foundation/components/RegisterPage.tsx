import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { RegisterPageProps } from '@/../product/sections/foundation/types'

export function RegisterPage({
  isRegistering,
  isSendingCode,
  codeCountdown,
  error,
  onRegister,
  onSendVerificationCode,
  onGoToLogin,
}: RegisterPageProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, _setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  // 密码强度检查
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    if (strength <= 2) return { strength: 1, label: '弱', color: 'bg-red-500' }
    if (strength <= 4) return { strength: 2, label: '中', color: 'bg-yellow-500' }
    return { strength: 3, label: '强', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const isFormValid =
    emailOrPhone.trim() !== '' &&
    verificationCode.trim() !== '' &&
    password.length >= 8 &&
    passwordsMatch &&
    agreeToTerms

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    onRegister({
      emailOrPhone: emailOrPhone.trim(),
      verificationCode: verificationCode.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
      agreeToTerms,
    })
  }

  const handleSendCode = () => {
    if (!emailOrPhone.trim()) return
    onSendVerificationCode(emailOrPhone.trim())
  }

  const canSendCode = emailOrPhone.trim() !== '' && codeCountdown === 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo 和标题 */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-4xl">📸</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          创建账号
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          加入 PhotoEnglish，开始您的英语学习之旅
        </p>
      </div>

      {/* 注册表单卡片 */}
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 错误提示 */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          {/* 邮箱/手机号输入框 */}
          <div>
            <label htmlFor="reg-emailOrPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              邮箱或手机号
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="reg-emailOrPhone"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="请输入邮箱或手机号"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          {/* 验证码输入框 */}
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              验证码
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="输入6位验证码"
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={!canSendCode || isSendingCode}
                  className="px-5 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap text-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {codeCountdown > 0 ? `${codeCountdown}秒` : isSendingCode ? '发送中...' : '发送验证码'}
                </button>
            </div>
          </div>

          {/* 密码输入框 */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              设置密码
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少8位，包含字母和数字"
                className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* 密码强度指示器 */}
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  密码强度: {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* 确认密码输入框 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              确认密码
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              {confirmPassword && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {passwordsMatch ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 用户协议 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              我已阅读并同意{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                用户协议
              </a>{' '}
              和{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                隐私政策
              </a>
            </span>
          </label>

          {/* 注册按钮 */}
          <button
            type="submit"
            disabled={!isFormValid || isRegistering}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isRegistering ? '注册中...' : '注册'}
          </button>

          {/* 登录链接 */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            已有账号？{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
            >
              立即登录
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
