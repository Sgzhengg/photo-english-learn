// =============================================================================
// PhotoEnglish - Global Data Model
// =============================================================================

// -----------------------------------------------------------------------------
// User Entity
// -----------------------------------------------------------------------------

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
  /** 英语水平 */
  englishLevel: 'beginner' | 'intermediate' | 'advanced'
  /** 每日学习目标（单词数） */
  dailyGoal: '10' | '20' | '30' | '50'
  /** 用户状态 */
  status: 'active' | 'inactive' | 'suspended'
  /** 注册时间 */
  createdAt: string
  /** 最后登录时间 */
  lastLoginAt: string
  /** 是否已完成新用户引导 */
  hasCompletedOnboarding: boolean
}

// -----------------------------------------------------------------------------
// Photo Entity
// -----------------------------------------------------------------------------

export type PhotoStatus = 'processing' | 'completed' | 'failed'

export interface Photo {
  /** 照片唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 原始图片 URL */
  imageUrl: string
  /** 缩略图 URL */
  thumbnailUrl: string
  /** 拍摄时间 */
  capturedAt: string
  /** 拍摄地点 */
  location?: string
  /** 识别状态 */
  status: PhotoStatus
  /** 识别出的单词列表 */
  recognizedWords: RecognizedWord[]
  /** 场景描述句子（英文） */
  sceneDescription: string
  /** 场景描述句子（中文翻译） */
  sceneTranslation: string
}

export interface RecognizedWord {
  /** 单词唯一标识 */
  id: string
  /** 英文单词 */
  word: string
  /** 音标 */
  phonetic: string
  /** 中文释义 */
  definition: string
  /** 词性 */
  partOfSpeech?: string
  /** 发音音频 URL */
  pronunciationUrl?: string
  /** 在场景句子中的单词位置索引 */
  positionInSentence: number
}

// -----------------------------------------------------------------------------
// Word Entity
// -----------------------------------------------------------------------------

export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered'

export interface Word {
  /** 单词唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 英文单词 */
  word: string
  /** 音标 */
  phonetic: string
  /** 中文释义 */
  definition: string
  /** 词性 */
  partOfSpeech?: string
  /** 例句（英文） */
  exampleSentence?: string
  /** 例句翻译 */
  exampleTranslation?: string
  /** 发音音频 URL */
  pronunciationUrl?: string
  /** 掌握程度 */
  masteryLevel: MasteryLevel
  /** 学习次数 */
  practiceCount: number
  /** 正确次数 */
  correctCount: number
  /** 标签列表 */
  tags: string[]
  /** 来源照片 ID */
  sourcePhotoId?: string
  /** 首次保存时间 */
  savedAt: string
  /** 最后练习时间 */
  lastPracticedAt?: string
  /** 下次复习时间 */
  nextReviewAt?: string
}

// -----------------------------------------------------------------------------
// Tag Entity
// -----------------------------------------------------------------------------

export interface Tag {
  /** 标签唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 标签名称 */
  name: string
  /** 标签颜色 */
  color?: string
  /** 单词数量 */
  wordCount: number
  /** 创建时间 */
  createdAt: string
}

// -----------------------------------------------------------------------------
// Practice Entity
// -----------------------------------------------------------------------------

export type PracticeType = 'fill-blank' | 'translation' | 'scene-sentence'
export type PracticeStatus = 'pending' | 'correct' | 'incorrect'

export interface Practice {
  /** 练习唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 单词 ID */
  wordId?: string
  /** 场景句子 ID（场景句子练习） */
  photoId?: string
  /** 练习类型 */
  practiceType: PracticeType
  /** 题目 */
  question: string
  /** 用户答案 */
  userAnswer?: string
  /** 正确答案 */
  correctAnswer: string
  /** 练习状态 */
  status: PracticeStatus
  /** 练习时间 */
  practicedAt: string
  /** 用时（秒） */
  timeSpent?: number
}

// -----------------------------------------------------------------------------
// Review Entity
// -----------------------------------------------------------------------------

export type ReviewStatus = 'pending' | 'correct' | 'incorrect' | 'skipped'

export interface Review {
  /** 复习唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 单词 ID */
  wordId: string
  /** 用户输入的单词 */
  userAnswer?: string
  /** 复习状态 */
  status: ReviewStatus
  /** 复习时间 */
  reviewedAt: string
  /** 下次复习时间（间隔重复算法） */
  nextReviewAt: string
  /** 复习轮次 */
  reviewRound: number
}

// -----------------------------------------------------------------------------
// Progress Entity
// -----------------------------------------------------------------------------

export interface Progress {
  /** 统计唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 生词总数 */
  totalWords: number
  /** 今日新增单词数 */
  newWordsToday: number
  /** 本周新增单词数 */
  newWordsThisWeek: number
  /** 总练习次数 */
  totalPractices: number
  /** 总正确次数 */
  correctPractices: number
  /** 正确率（百分比） */
  accuracyRate: number
  /** 总复习次数 */
  totalReviews: number
  /** 连续学习天数 */
  streakDays: number
  /** 最后学习日期 */
  lastStudyDate?: string
  /** 学习里程碑 */
  achievements: Achievement[]
  /** 更新时间 */
  updatedAt: string
}

export interface Achievement {
  /** 成就 ID */
  id: string
  /** 成就标题 */
  title: string
  /** 成就描述 */
  description: string
  /** 成就图标 */
  icon: string
  /** 是否已解锁 */
  unlocked: boolean
  /** 解锁时间 */
  unlockedAt?: string
}
