import { Play, Calendar, TrendingUp, BookOpen, Clock, Target, CheckCircle2, ArrowRight } from 'lucide-react'
import type { PracticeReviewProps as Props, DailyTask, MasteryLevel } from '../types'

interface DailyTaskHomeProps {
  dailyTask: DailyTask
  progressStats: Props['progressStats']
  wrongAnswersCount: number
  onStartPractice?: () => void
  onViewReviewSchedule?: () => void
  onViewProgressStats?: () => void
  onReviewWrongAnswers?: () => void
}

// 掌握程度标签
function MasteryBadge({ level }: { level: MasteryLevel }) {
  const config = {
    learning: { label: '学习中', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    familiar: { label: '熟悉', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    mastered: { label: '已掌握', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' },
  }[level]

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {config.label}
    </span>
  )
}

export function DailyTaskHome({
  dailyTask,
  progressStats,
  wrongAnswersCount,
  onStartPractice,
  onViewReviewSchedule,
  onViewProgressStats,
  onReviewWrongAnswers,
}: DailyTaskHomeProps) {
  // 统计各级别单词数量
  const levelCounts = dailyTask.words.reduce((acc, word) => {
    acc[word.masteryLevel] = (acc[word.masteryLevel] || 0) + 1
    return acc
  }, {} as Record<MasteryLevel, number>)

  return (
    <div className="space-y-6 px-4 pb-6 max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          今日练习
        </h1>
        <p className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          坚持每日练习，科学巩固记忆
        </p>
      </div>

      {/* 今日任务主卡片 */}
      <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 dark:from-indigo-600 dark:via-indigo-700 dark:to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none overflow-hidden relative">
        {/* 装饰性背景图案 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                {new Date(dailyTask.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
              <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                今日有 {dailyTask.wordsCount} 个单词需要复习
              </h2>
              <div className="flex items-center gap-4 text-indigo-100 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  预计 {dailyTask.estimatedMinutes} 分钟
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  3 种练习类型
                </span>
              </div>
            </div>

            {/* 连续学习天数徽章 */}
            {progressStats && progressStats.currentStreak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                <CheckCircle2 className="w-5 h-5 text-lime-300" fill="currentColor" />
                <span className="text-sm font-semibold">
                  {progressStats.currentStreak} 天连续学习
                </span>
              </div>
            )}
          </div>

          {/* 单词级别统计 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-indigo-100 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                学习中
              </div>
              <div className="text-2xl font-bold">
                {levelCounts.learning || 0}
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-indigo-100 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                熟悉
              </div>
              <div className="text-2xl font-bold">
                {levelCounts.familiar || 0}
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-indigo-100 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                已掌握
              </div>
              <div className="text-2xl font-bold">
                {levelCounts.mastered || 0}
              </div>
            </div>
          </div>

          {/* 开始练习按钮 */}
          <button
            onClick={onStartPractice}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Play className="w-6 h-6" fill="currentColor" />
            开始练习
          </button>
        </div>
      </div>

      {/* 待复习单词列表 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            待复习单词
          </h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {dailyTask.words.slice(0, 5).map((word, index) => (
            <div key={word.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {word.word}
                  </h4>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                    {word.phonetic}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {word.definition}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <MasteryBadge level={word.masteryLevel} />
                <span className="text-xs text-slate-500 dark:text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {word.reviewCount}次
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 功能入口卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 复习日程 */}
        <button
          onClick={onViewReviewSchedule}
          className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-5 hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200 text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              复习日程
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            查看下次复习时间
          </p>
        </button>

        {/* 错题复习 */}
        <button
          onClick={onReviewWrongAnswers}
          className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-5 hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200 text-left relative"
        >
          {wrongAnswersCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{wrongAnswersCount}</span>
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              错题复习
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            {wrongAnswersCount > 0 ? `${wrongAnswersCount} 个单词待复习` : '暂无错题'}
          </p>
        </button>

        {/* 进度统计 */}
        <button
          onClick={onViewProgressStats}
          className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-5 hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200 text-left"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-lime-100 dark:bg-lime-900/30 rounded-xl">
              <TrendingUp className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              进度统计
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            查看学习数据
          </p>
        </button>
      </div>

      {/* 学习摘要 */}
      {progressStats && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            学习摘要
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                总单词数
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {progressStats.totalWords}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                平均正确率
              </p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {Math.round(progressStats.averageAccuracy * 100)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                学习天数
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {progressStats.studyDays}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                连续学习
              </p>
              <p className="text-2xl font-bold text-lime-600 dark:text-lime-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {progressStats.currentStreak}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
