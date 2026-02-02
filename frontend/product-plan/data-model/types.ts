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
  /** 发音音频 URL */
  pronunciationUrl?: string
  /** 例句列表 */
  examples: WordExample[]
  /** 标签列表 */
  tags: string[]
  /** 掌握程度 */
  masteryLevel: MasteryLevel
  /** 添加时间 */
  addedAt: string
  /** 来源照片 ID */
  sourcePhotoId?: string
}

export interface WordExample {
  /** 英文例句 */
  english: string
  /** 中文翻译 */
  chinese: string
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
  /** 创建时间 */
  createdAt: string
}

// -----------------------------------------------------------------------------
// Practice Entity
// -----------------------------------------------------------------------------

export type PracticeType = 'fill-blank' | 'multiple-choice' | 'dictation'

export interface Practice {
  /** 练习记录唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 单词 ID */
  wordId: string
  /** 练习类型 */
  type: PracticeType
  /** 题目 */
  question: string
  /** 用户答案 */
  userAnswer: string
  /** 正确答案 */
  correctAnswer: string
  /** 是否正确 */
  isCorrect: boolean
  /** 练习时间 */
  practicedAt: string
  /** 用时（秒） */
  duration?: number
}

export interface PracticeQuestion {
  /** 题目 ID */
  id: string
  /** 单词 ID */
  wordId: string
  /** 练习类型 */
  type: PracticeType
  /** 题目 */
  question: string
  /** 提示 */
  hint: string
  /** 选项（选择题用） */
  options?: PracticeOption[]
  /** 正确答案 */
  correctAnswer: string
  /** 音标（听写题用） */
  phonetic?: string
  /** 音频 URL（听写题用） */
  audioUrl?: string
}

export interface PracticeOption {
  /** 选项 ID */
  id: string
  /** 选项文字 */
  text: string
}

// -----------------------------------------------------------------------------
// Review Entity
// -----------------------------------------------------------------------------

export interface Review {
  /** 复习记录唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 单词 ID */
  wordId: string
  /** 复习结果 */
  result: 'correct' | 'incorrect' | 'skipped'
  /** 复习时间 */
  reviewedAt: string
  /** 下次复习时间 */
  nextReviewAt: string
  /** 间隔重复次数 */
  interval: number
  /** 难度系数 (0-5) */
  easeFactor: number
}

// -----------------------------------------------------------------------------
// Progress Entity
// -----------------------------------------------------------------------------

export interface Progress {
  /** 进度记录唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 生词总数 */
  totalWords: number
  /** 今日新增单词数 */
  todayAdded: number
  /** 今日练习次数 */
  todayPracticed: number
  /** 今日正确率 */
  todayAccuracy: number
  /** 连续学习天数 */
  streakDays: number
  /** 总学习天数 */
  totalDays: number
  /** 掌握程度分布 */
  masteryDistribution: MasteryDistribution
  /** 最后更新时间 */
  updatedAt: string
}

export interface MasteryDistribution {
  /** 新单词数 */
  new: number
  /** 学习中 */
  learning: number
  /** 熟悉 */
  familiar: number
  /** 已掌握 */
  mastered: number
}

// -----------------------------------------------------------------------------
// Activity & Statistics
// -----------------------------------------------------------------------------

export interface DailyActivity {
  /** 日期 */
  date: string
  /** 新增单词数 */
  added: number
  /** 练习次数 */
  practiced: number
  /** 正确率 */
  accuracy: number
}

export interface Achievement {
  /** 成就 ID */
  id: string
  /** 成就名称 */
  name: string
  /** 图标 */
  icon: string
  /** 描述 */
  description: string
  /** 是否已解锁 */
  unlocked: boolean
  /** 解锁时间 */
  unlockedAt?: string
  /** 解锁进度 */
  progress?: string
}
