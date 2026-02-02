import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import type { LoginPageProps, LoginFormData } from '../types'

export function LoginPage({ isLoggingIn, error, onLogin, onForgotPassword, onGoToRegister }: LoginPageProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailOrPhone.trim() || !password.trim()) return

    onLogin({
      emailOrPhone: emailOrPhone.trim(),
      password: password.trim(),
      keepLoggedIn,
    })
  }

  const isFormValid = emailOrPhone.trim() !== '' && password.trim() !== ''

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo 和标题 */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-4xl">📸</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          PhotoEnglish
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          拍照学英语，轻松积累词汇
        </p>
      </div>

      {/* 登录表单卡片 */}
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          欢迎回来
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label htmlFor="emailOrPhone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              邮箱或手机号
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="emailOrPhone"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="请输入邮箱或手机号"
                autoComplete="username"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          {/* 密码输入框 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
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
          </div>

          {/* 忘记密码 & 保持登录 */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                保持登录状态
              </span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              忘记密码？
            </button>
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={!isFormValid || isLoggingIn}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isLoggingIn ? '登录中...' : '登录'}
          </button>

          {/* 注册链接 */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            还没有账号？{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
            >
              立即注册
            </button>
          </p>
        </form>
      </div>

      {/* 底部版权信息 */}
      <p className="mt-8 text-xs text-slate-500 dark:text-slate-400 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
        登录即表示您同意我们的{' '}
        <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          用户协议
        </a>{' '}
        和{' '}
        <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          隐私政策
        </a>
      </p>
    </div>
  )
}
