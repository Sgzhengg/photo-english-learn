// =============================================================================
// Data Types
// =============================================================================

export type ActivityType = 'photo' | 'practice' | 'review'

export interface DailyStats {
  /** 日期 */
  date: string
  /** 学习天数（0或1） */
  studyDays: number
  /** 练习次数 */
  practiceSessions: number
  /** 完成的复习数量 */
  reviewsCompleted: number
}

export interface AccuracyDataPoint {
  /** 日期 */
  date: string
  /** 正确率（0-1） */
  accuracy: number
}

export interface VocabularyGrowthPoint {
  /** 日期 */
  date: string
  /** 累计生词总数 */
  totalWords: number
}

export interface TodayStats {
  /** 日期 */
  date: string
  /** 今日学习的生词数 */
  wordsLearned: number
  /** 练习次数 */
  practiceSessions: number
  /** 完成的复习数量 */
  reviewsCompleted: number
  /** 正确率 */
  accuracy: number
  /** 学习时长（分钟） */
  studyMinutes: number
}

export interface PeriodStats {
  /** 开始日期 */
  startDate?: string
  /** 结束日期 */
  endDate?: string
  /** 月份（用于月度统计） */
  month?: string
  /** 学习天数 */
  studyDays: number
  /** 学习的生词数 */
  wordsLearned: number
  /** 练习次数 */
  practiceSessions: number
  /** 完成的复习数量 */
  reviewsCompleted: number
  /** 平均正确率 */
  averageAccuracy: number
  /** 总学习时长（分钟） */
  totalStudyMinutes: number
}

export interface OverviewStats {
  /** 今日统计 */
  today: TodayStats
  /** 本周统计 */
  thisWeek: PeriodStats
  /** 本月统计 */
  thisMonth: PeriodStats
}

export interface ChartData {
  /** 学习活动趋势（90天数据） */
  activityTrend: DailyStats[]
  /** 正确率曲线（90天数据） */
  accuracyTrend: AccuracyDataPoint[]
  /** 生词增长曲线（90天数据） */
  vocabularyGrowth: VocabularyGrowthPoint[]
}

export interface MasteryLevelStats {
  /** 已掌握 */
  mastered: number
  /** 熟悉 */
  familiar: number
  /** 学习中 */
  learning: number
}

export interface TagStat {
  /** 标签名称 */
  tag: string
  /** 该标签下的生词数量 */
  count: number
}

export interface WordStats {
  /** 总生词数 */
  totalWords: number
  /** 按掌握程度分组统计 */
  byMasteryLevel: MasteryLevelStats
  /** 热门标签统计 */
  topTags: TagStat[]
}

export interface ActivityDetails {
  /** 照片ID（拍照活动） */
  photoId?: string
  /** 生词数量（拍照活动） */
  wordCount?: number
  /** 题目数量（练习活动） */
  questionCount?: number
  /** 正确题目数（练习活动） */
  correctCount?: number
  /** 复习数量（复习活动） */
  reviewCount?: number
  /** 正确率（复习活动） */
  accuracy?: number
  /** 时长（分钟，练习活动） */
  duration?: number
}

export interface RecentActivity {
  /** 活动唯一标识 */
  id: string
  /** 活动类型 */
  type: ActivityType
  /** 时间戳 */
  timestamp: string
  /** 活动描述 */
  description: string
  /** 活动详情 */
  details: ActivityDetails
}

export interface Achievement {
  /** 成就唯一标识 */
  id: string
  /** 成就名称 */
  name: string
  /** 成就描述 */
  description: string
  /** 成就图标 */
  icon: string
  /** 解锁时间（null表示未解锁） */
  unlockedAt: string | null
  /** 当前进度 */
  progress: number
  /** 目标值 */
  target: number
}

// =============================================================================
// Component Props
// =============================================================================

export interface ProgressDashboardProps {
  /** 学习概览统计 */
  overviewStats: OverviewStats
  /** 图表数据 */
  chartData: ChartData
  /** 生词统计 */
  wordStats: WordStats
  /** 最近学习活动 */
  recentActivity: RecentActivity[]
  /** 成就徽章列表 */
  achievements: Achievement[]

  /** 当用户查看某日详细数据时调用 */
  onViewDayDetails?: (date: string) => void
  /** 当用户查看某个标签的生词时调用 */
  onViewTagWords?: (tag: string) => void
  /** 当用户查看成就详情时调用 */
  onViewAchievement?: (achievementId: string) => void
  /** 当用户查看某个活动的详细信息时调用 */
  onViewActivityDetails?: (activityId: string) => void
}
