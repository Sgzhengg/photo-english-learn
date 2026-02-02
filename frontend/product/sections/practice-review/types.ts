// =============================================================================
// Data Types
// =============================================================================

export type PracticeType = 'fill-blank' | 'multiple-choice' | 'dictation'
export type MasteryLevel = 'learning' | 'familiar' | 'mastered'

export interface WordInTask {
  /** 单词唯一标识 */
  id: string
  /** 英文单词 */
  word: string
  /** 音标 */
  phonetic: string
  /** 中文释义 */
  definition: string
  /** 掌握程度 */
  masteryLevel: MasteryLevel
  /** 复习次数 */
  reviewCount: number
  /** 下次复习时间 */
  nextReviewDate: string
  /** 例句列表 */
  examples: Array<{
    sentence: string
    translation: string
    sourcePhoto: string
  }>
}

export interface DailyTask {
  /** 任务唯一标识 */
  id: string
  /** 任务日期 */
  date: string
  /** 单词数量 */
  wordsCount: number
  /** 预计用时（分钟） */
  estimatedMinutes: number
  /** 练习类型列表 */
  practiceTypes: PracticeType[]
  /** 需要复习的单词列表 */
  words: WordInTask[]
}

export interface QuestionOption {
  /** 选项唯一标识 */
  id: string
  /** 选项文本 */
  text: string
  /** 是否正确答案 */
  isCorrect: boolean
}

export interface PracticeQuestion {
  /** 题目唯一标识 */
  id: string
  /** 题目类型 */
  type: PracticeType
  /** 题目内容 */
  question: string
  /** 关联的单词 ID */
  wordId: string
  /** 正确答案 */
  correctAnswer: string
  /** 提示（中文释义等） */
  hint: string
  /** 音频 URL（听写题型） */
  audioUrl?: string
  /** 音标（听写题型） */
  phonetic?: string
  /** 选项列表（选择题题型） */
  options: QuestionOption[]
}

export interface WrongAnswer {
  /** 题目 ID */
  questionId: string
  /** 单词 ID */
  wordId: string
  /** 单词 */
  word: string
  /** 音标 */
  phonetic: string
  /** 释义 */
  definition: string
  /** 用户的错误答案 */
  userWrongAnswer: string
  /** 加入错题队列的时间 */
  addedAt: string
  /** 复习次数 */
  reviewCount: number
}

export interface PracticeResult {
  /** 结果唯一标识 */
  id: string
  /** 任务 ID */
  taskId: string
  /** 完成时间 */
  completedAt: string
  /** 总题数 */
  totalQuestions: number
  /** 正确题数 */
  correctAnswers: number
  /** 得分 */
  score: number
  /** 正确率 */
  accuracy: number
  /** 用时（秒） */
  durationSeconds: number
  /** 错题列表 */
  wrongAnswers: Array<{
    questionId: string
    userAnswer: string
    correctAnswer: string
    wordId: string
  }>
}

export interface ReviewScheduleItem {
  /** 单词 ID */
  wordId: string
  /** 单词 */
  word: string
  /** 下次复习时间 */
  nextReviewDate: string
  /** 间隔天数 */
  intervalDays: number
  /** 难度因子（SM-2算法） */
  easeFactor: number
  /** 复习次数 */
  reviewCount: number
}

export interface ProgressStats {
  /** 总单词数 */
  totalWords: number
  /** 已掌握单词数 */
  masteredWords: number
  /** 熟悉单词数 */
  familiarWords: number
  /** 学习中单词数 */
  learningWords: number
  /** 总练习次数 */
  totalPracticeSessions: number
  /** 总复习次数 */
  totalReviews: number
  /** 平均正确率 */
  averageAccuracy: number
  /** 学习天数 */
  studyDays: number
  /** 当前连续学习天数 */
  currentStreak: number
  /** 最长连续学习天数 */
  longestStreak: number
  /** 最后练习时间 */
  lastPracticeDate: string
  /** 每周正确率趋势 */
  weeklyAccuracy: Array<{
    date: string
    accuracy: number
  }>
}

// =============================================================================
// Component Props
// =============================================================================

export interface PracticeReviewProps {
  /** 今日任务 */
  dailyTask: DailyTask | null
  /** 练习题目列表 */
  questions: PracticeQuestion[]
  /** 当前题目索引 */
  currentQuestionIndex: number
  /** 用户答案映射 */
  userAnswers: Map<string, string>
  /** 是否正在播放音频 */
  isPlayingAudio: boolean
  /** 练习是否已完成 */
  isPracticeComplete: boolean
  /** 练习结果 */
  practiceResult: PracticeResult | null
  /** 错题复习队列 */
  wrongAnswersQueue: WrongAnswer[]
  /** 复习日程 */
  reviewSchedule: ReviewScheduleItem[]
  /** 进度统计 */
  progressStats: ProgressStats | null

  /** 当用户开始练习时调用 */
  onStartPractice?: () => void
  /** 当用户提交答案时调用 */
  onSubmitAnswer?: (questionId: string, answer: string) => void
  /** 当用户跳过题目时调用 */
  onSkipQuestion?: (questionId: string) => void
  /** 当用户播放音频时调用 */
  onPlayAudio?: (audioUrl: string) => void
  /** 当用户停止音频时调用 */
  onStopAudio?: () => void
  /** 当用户开始新一轮练习时调用 */
  onRestartPractice?: () => void
  /** 当用户查看答案时调用 */
  onShowAnswer?: (questionId: string) => void
  /** 当用户进入错题复习时调用 */
  onReviewWrongAnswers?: () => void
  /** 当用户查看复习日程时调用 */
  onViewReviewSchedule?: () => void
  /** 当用户查看进度统计时调用 */
  onViewProgressStats?: () => void
}
