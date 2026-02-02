import { Calendar, BookOpen, Target, Award, TrendingUp, Flame, CheckCircle2, Clock, Tag } from 'lucide-react'
import type { ProgressDashboardProps as Props } from '../types'

// 学习概览卡片
function OverviewCards({ overviewStats }: { overviewStats: Props['overviewStats'] }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* 今日统计 */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-indigo-200" />
          <span className="text-sm font-medium text-indigo-100" style={{ fontFamily: 'Inter, sans-serif' }}>
            今日
          </span>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {overviewStats.today.wordsLearned}
            </p>
            <p className="text-xs text-indigo-200" style={{ fontFamily: 'Inter, sans-serif' }}>
              新学单词
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-indigo-200">{overviewStats.today.practiceSessions} 次练习</span>
            <span className="text-indigo-200">{overviewStats.today.accuracy * 100}% 正确</span>
          </div>
        </div>
      </div>

      {/* 本周统计 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            本周
          </span>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {overviewStats.thisWeek.studyDays} 天
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              学习天数
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600 dark:text-slate-400">{overviewStats.thisWeek.wordsLearned} 词</span>
            <span className="text-slate-600 dark:text-slate-400">{Math.round(overviewStats.thisWeek.averageAccuracy * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 本月统计 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            本月
          </span>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {overviewStats.thisMonth.wordsLearned}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              新学单词
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600 dark:text-slate-400">{overviewStats.thisMonth.studyDays} 天</span>
            <span className="text-slate-600 dark:text-slate-400">{overviewStats.thisMonth.practiceSessions} 次</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 简单的柱状图组件
function SimpleBarChart({ data, height = 120 }: { data: Array<{ label: string; value: number }>; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xs text-slate-600 dark:text-slate-400 w-8 flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif' }}>
            {item.label}
          </span>
          <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-8 text-right" style={{ fontFamily: 'Inter, sans-serif' }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// 掌握程度分布
function MasteryDistribution({ wordStats }: { wordStats: Props['wordStats'] }) {
  const total = wordStats.totalWords
  const masteredPercent = total > 0 ? (wordStats.byMasteryLevel.mastered / total) * 100 : 0
  const familiarPercent = total > 0 ? (wordStats.byMasteryLevel.familiar / total) * 100 : 0
  const learningPercent = total > 0 ? (wordStats.byMasteryLevel.learning / total) * 100 : 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        掌握程度分布
      </h3>

      {/* 堆叠条形图 */}
      <div className="h-10 rounded-full overflow-hidden flex mb-4">
        <div
          className="bg-emerald-500 transition-all duration-500 flex items-center justify-center"
          style={{ width: `${masteredPercent}%` }}
        >
          {masteredPercent > 15 && (
            <span className="text-xs font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              {masteredPercent.toFixed(0)}%
            </span>
          )}
        </div>
        <div
          className="bg-blue-500 transition-all duration-500 flex items-center justify-center"
          style={{ width: `${familiarPercent}%` }}
        >
          {familiarPercent > 15 && (
            <span className="text-xs font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              {familiarPercent.toFixed(0)}%
            </span>
          )}
        </div>
        <div
          className="bg-amber-500 transition-all duration-500 flex items-center justify-center"
          style={{ width: `${learningPercent}%` }}
        >
          {learningPercent > 15 && (
            <span className="text-xs font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              {learningPercent.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* 图例和数字 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              已掌握
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {wordStats.byMasteryLevel.mastered}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              熟悉
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {wordStats.byMasteryLevel.familiar}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              学习中
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {wordStats.byMasteryLevel.learning}
          </p>
        </div>
      </div>
    </div>
  )
}

// 标签统计
function TagStats({ wordStats }: { wordStats: Props['wordStats'] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          热门标签
        </h3>
      </div>

      <div className="space-y-3">
        {wordStats.topTags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <span className="font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Inter, sans-serif' }}>
              {tag.tag}
            </span>
            <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold">
              {tag.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 成就徽章
function AchievementsList({ achievements }: { achievements: Props['achievements'] }) {
  const unlocked = achievements.filter(a => a.unlockedAt)
  const locked = achievements.filter(a => !a.unlockedAt)

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800/50">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          成就徽章
        </h3>
        <span className="ml-auto text-sm text-amber-700 dark:text-amber-400 font-semibold">
          {unlocked.length}/{achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {achievements.map((achievement) => {
          const isUnlocked = achievement.unlockedAt !== null
          const progress = (achievement.progress / achievement.target) * 100

          return (
            <div
              key={achievement.id}
              className={`relative p-3 rounded-xl text-center transition-all ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 shadow-sm'
                  : 'bg-white/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <p className={`text-xs font-semibold mb-1 ${isUnlocked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                {achievement.name}
              </p>
              {!isUnlocked && (
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 最近活动时间线
function ActivityTimeline({ recentActivity }: { recentActivity: Props['recentActivity'] }) {
  const activityIcons = {
    photo: '📸',
    practice: '✏️',
    review: '🔄',
  }

  const activityColors = {
    photo: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    practice: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    review: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          最近活动
        </h3>
      </div>

      <div className="space-y-3">
        {recentActivity.map((activity, index) => {
          const date = new Date(activity.timestamp)
          const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          const dateStr = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${activityColors[activity.type]} flex items-center justify-center text-xl`}>
                {activityIcons[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {activity.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {dateStr} {timeStr}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ProgressDashboard({
  overviewStats,
  chartData,
  wordStats,
  recentActivity,
  achievements,
  onViewDayDetails,
  onViewTagWords,
  onViewAchievement,
  onViewActivityDetails,
}: Props) {
  // 准备最近7天的活动数据用于柱状图
  const recentActivityData = chartData.activityTrend.slice(-7).map((day) => ({
    label: new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' }),
    value: day.practiceSessions,
  }))

  // 准备最近7天的正确率数据
  const recentAccuracyData = chartData.accuracyTrend.slice(-7).map((day) => ({
    label: new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' }),
    value: Math.round(day.accuracy * 100),
  }))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-safe">
      {/* 顶部标题区 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            进度统计
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            追踪您的学习进展和成就
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 学习概览卡片 */}
        <OverviewCards overviewStats={overviewStats} />

        {/* 掌握程度分布 */}
        <MasteryDistribution wordStats={wordStats} />

        {/* 最近练习活动 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              最近练习活动（近7天）
            </h3>
          </div>
          <SimpleBarChart data={recentActivityData} height={120} />
        </div>

        {/* 最近正确率 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              正确率趋势（近7天）
            </h3>
          </div>
          <SimpleBarChart data={recentAccuracyData} height={120} />
        </div>

        {/* 生词增长和标签统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                词汇积累
              </h3>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {wordStats.totalWords}
              </p>
              <p className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                累计学习生词
              </p>
            </div>
          </div>

          <TagStats wordStats={wordStats} />
        </div>

        {/* 成就徽章 */}
        <AchievementsList achievements={achievements} />

        {/* 最近活动 */}
        <ActivityTimeline recentActivity={recentActivity} />
      </div>
    </div>
  )
}
