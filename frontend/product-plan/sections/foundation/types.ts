// =============================================================================
// Data Types
// =============================================================================

/** 用户英语水平 */
export type EnglishLevel = 'beginner' | 'intermediate' | 'advanced'

/** 每日学习目标 */
export type DailyGoal = '10' | '20' | '30' | '50'

/** 用户状态 */
export type UserStatus = 'active' | 'inactive' | 'suspended'

/** 认证方式 */
export type AuthMethod = 'email' | 'phone' | 'social'

/** 用户性别 */
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

/** 用户接口 */
export interface User {
  /** 用户唯一标识 */
  id: string
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone?: string
  /** 昵称 */
  nickname: string
  /** 头像 URL */
  avatar?: string
  /** 性别 */
  gender?: Gender
  /** 出生年月 */
  birthYear?: number
  /** 英语水平 */
  englishLevel: EnglishLevel
  /** 每日学习目标（单词数） */
  dailyGoal: DailyGoal
  /** 用户状态 */
  status: UserStatus
  /** 注册时间 */
  createdAt: string
  /** 最后登录时间 */
  lastLoginAt: string
  /** 是否已完成新用户引导 */
  hasCompletedOnboarding: boolean
}

/** 认证响应接口 */
export interface AuthResponse {
  /** JWT 访问令牌 */
  accessToken: string
  /** JWT 刷新令牌 */
  refreshToken: string
  /** 令牌过期时间（Unix 时间戳，秒） */
  expiresAt: number
  /** 用户信息 */
  user: User
}

/** 引导页面索引 */
export type OnboardingStep = 0 | 1 | 2 | 3

/** 用户偏好设置（引导页收集） */
export interface UserPreferences {
  /** 英语水平 */
  englishLevel: EnglishLevel
  /** 每日学习目标 */
  dailyGoal: DailyGoal
}

// =============================================================================
// Component Props
// =============================================================================

/** 登录表单数据 */
export interface LoginFormData {
  /** 邮箱或手机号 */
  emailOrPhone: string
  /** 密码 */
  password: string
  /** 是否保持登录状态 */
  keepLoggedIn: boolean
}

/** 注册表单数据 */
export interface RegisterFormData {
  /** 邮箱或手机号 */
  emailOrPhone: string
  /** 验证码 */
  verificationCode: string
  /** 密码 */
  password: string
  /** 确认密码 */
  confirmPassword: string
  /** 是否同意用户协议 */
  agreeToTerms: boolean
}

/** 重置密码表单数据 */
export interface ResetPasswordFormData {
  /** 邮箱或手机号 */
  emailOrPhone: string
  /** 验证码 */
  verificationCode: string
  /** 新密码 */
  newPassword: string
  /** 确认新密码 */
  confirmNewPassword: boolean
}

/** 登录页面组件 Props */
export interface LoginPageProps {
  /** 是否正在登录 */
  isLoggingIn: boolean
  /** 错误信息 */
  error?: string
  /** 当用户点击登录按钮时调用 */
  onLogin: (data: LoginFormData) => void
  /** 当用户点击"忘记密码"时调用 */
  onForgotPassword: () => void
  /** 当用户点击"注册"时调用 */
  onGoToRegister: () => void
}

/** 注册页面组件 Props */
export interface RegisterPageProps {
  /** 是否正在注册 */
  isRegistering: boolean
  /** 是否正在发送验证码 */
  isSendingCode: boolean
  /** 验证码倒计时（秒），0 表示不在倒计时 */
  codeCountdown: number
  /** 错误信息 */
  error?: string
  /** 当用户点击注册按钮时调用 */
  onRegister: (data: RegisterFormData) => void
  /** 当用户点击发送验证码时调用 */
  onSendVerificationCode: (emailOrPhone: string) => void
  /** 当用户点击"登录"时调用 */
  onGoToLogin: () => void
}

/** 重置密码页面组件 Props */
export interface ResetPasswordPageProps {
  /** 是否正在重置密码 */
  isResetting: boolean
  /** 是否正在发送验证码 */
  isSendingCode: boolean
  /** 验证码倒计时（秒） */
  codeCountdown: number
  /** 错误信息 */
  error?: string
  /** 成功信息 */
  success?: string
  /** 当用户点击重置密码按钮时调用 */
  onResetPassword: (data: ResetPasswordFormData) => void
  /** 当用户点击发送验证码时调用 */
  onSendVerificationCode: (emailOrPhone: string) => void
  /** 当用户点击"返回登录"时调用 */
  onGoToLogin: () => void
}

/** 引导页面组件 Props */
export interface OnboardingPageProps {
  /** 当前引导步骤索引 */
  currentStep: OnboardingStep
  /** 用户偏好设置 */
  preferences: UserPreferences
  /** 当用户点击"下一步"时调用 */
  onNext: () => void
  /** 当用户点击"上一步"时调用 */
  onPrevious: () => void
  /** 当用户点击"跳过"时调用 */
  onSkip: () => void
  /** 当用户完成引导时调用 */
  onComplete: (preferences: UserPreferences) => void
  /** 当用户更新偏好设置时调用 */
  onUpdatePreferences: (preferences: UserPreferences) => void
}
