import { RotateCcw, Calendar, Target, TrendingUp, Award, Flame, BookOpen, CheckCircle2 } from 'lucide-react'
import type { PracticeReviewProps as Props, ProgressStats as ProgressStatsType } from '../types'

interface ProgressStatsProps {
  progressStats: ProgressStatsType
  onBackToHome?: () => void
}

// 掌握程度分布卡片
function MasteryDistribution({ progressStats }: { progressStats: ProgressStatsType }) {
  const total = progressStats.totalWords
  const masteredPercent = total > 0 ? (progressStats.masteredWords / total) * 100 : 0
  const familiarPercent = total > 0 ? (progressStats.familiarWords / total) * 100 : 0
  const learningPercent = total > 0 ? (progressStats.learningWords / total) * 100 : 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        掌握程度分布
      </h3>

      {/* 堆叠进度条 */}
      <div className="h-8 rounded-full overflow-hidden flex mb-4">
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: `${masteredPercent}%` }}
          title={`已掌握: ${progressStats.masteredWords}`}
        />
        <div
          className="bg-blue-500 transition-all duration-500"
          style={{ width: `${familiarPercent}%` }}
          title={`熟悉: ${progressStats.familiarWords}`}
        />
        <div
          className="bg-amber-500 transition-all duration-500"
          style={{ width: `${learningPercent}%` }}
          title={`学习中: ${progressStats.learningWords}`}
        />
      </div>

      {/* 图例 */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              已掌握
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {progressStats.masteredWords}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            {masteredPercent.toFixed(0)}%
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              熟悉
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {progressStats.familiarWords}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            {familiarPercent.toFixed(0)}%
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              学习中
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {progressStats.learningWords}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            {learningPercent.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  )
}

// 学习成就卡片
function AchievementCard({ progressStats }: { progressStats: ProgressStatsType }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-white/20 rounded-xl">
          <Award className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          学习成就
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-indigo-100">
            <Flame className="w-4 h-4" />
            <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
              当前连续
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {progressStats.currentStreak}
            <span className="text-lg ml-1">天</span>
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1 text-indigo-100">
            <Target className="w-4 h-4" />
            <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
              最长连续
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {progressStats.longestStreak}
            <span className="text-lg ml-1">天</span>
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1 text-indigo-100">
            <Calendar className="w-4 h-4" />
            <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
              学习天数
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {progressStats.studyDays}
            <span className="text-lg ml-1">天</span>
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1 text-indigo-100">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
              练习次数
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {progressStats.totalPracticeSessions}
            <span className="text-lg ml-1">次</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// 每周正确率趋势
function WeeklyAccuracyChart({ progressStats }: { progressStats: ProgressStatsType }) {
  const maxAccuracy = Math.max(...progressStats.weeklyAccuracy.map(d => d.accuracy), 1)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          每周正确率趋势
        </h3>
        <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          近7天
        </span>
      </div>

      <div className="space-y-3">
        {progressStats.weeklyAccuracy.map((day, index) => {
          const height = maxAccuracy > 0 ? (day.accuracy / maxAccuracy) * 100 : 0
          const date = new Date(day.date)
          const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
          const isToday = index === progressStats.weeklyAccuracy.length - 1

          return (
            <div key={day.date} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 text-center">
                <span className={`text-sm font-semibold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  周{dayOfWeek}
                </span>
              </div>
              <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    day.accuracy >= 0.9
                      ? 'bg-emerald-500'
                      : day.accuracy >= 0.7
                      ? 'bg-blue-500'
                      : day.accuracy >= 0.5
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${height}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {Math.round(day.accuracy * 100)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ProgressStats({ progressStats, onBackToHome }: ProgressStatsProps) {
  const avgAccuracy = Math.round(progressStats.averageAccuracy * 100)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-safe">
      {/* 顶部标题区 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              进度统计
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              追踪您的学习数据和成长
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 平均正确率卡片 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  平均正确率
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {avgAccuracy}%
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {progressStats.totalReviews} 次复习
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 学习成就卡片 */}
        <AchievementCard progressStats={progressStats} />

        {/* 掌握程度分布 */}
        <MasteryDistribution progressStats={progressStats} />

        {/* 每周正确率趋势 */}
        <WeeklyAccuracyChart progressStats={progressStats} />

        {/* 最后练习时间 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  最后练习时间
                </p>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {new Date(progressStats.lastPracticeDate).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
