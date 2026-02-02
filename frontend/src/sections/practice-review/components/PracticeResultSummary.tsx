import { Trophy, Target, Clock, RotateCcw, BookOpen, TrendingUp, X, CheckCircle2, ArrowRight } from 'lucide-react'
import type { PracticeResult, PracticeQuestion } from '@/../product/sections/practice-review/types'

interface PracticeResultSummaryProps {
  practiceResult: PracticeResult
  questions: PracticeQuestion[]
  onRestartPractice?: () => void
  onReviewWrongAnswers?: () => void
  onViewProgressStats?: () => void
  onBackToHome?: () => void
}

// 正确率环形进度组件
function AccuracyRing({ accuracy, size = 120 }: { accuracy: number; size?: number }) {
  const percentage = Math.round(accuracy * 100)
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (accuracy * circumference)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accuracy >= 0.9 ? '#a3e635' : accuracy >= 0.7 ? '#60a5fa' : accuracy >= 0.5 ? '#fbbf24' : '#f87171'} />
            <stop offset="100%" stopColor={accuracy >= 0.9 ? '#10b981' : accuracy >= 0.7 ? '#6366f1' : accuracy >= 0.5 ? '#f97316' : '#f43f5e'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {percentage}%
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          正确率
        </span>
      </div>
    </div>
  )
}

export function PracticeResultSummary({
  practiceResult,
  questions,
  onRestartPractice,
  onReviewWrongAnswers,
  onViewProgressStats,
  onBackToHome,
}: PracticeResultSummaryProps) {
  const accuracy = practiceResult.accuracy
  const minutes = Math.floor(practiceResult.durationSeconds / 60)
  const seconds = practiceResult.durationSeconds % 60

  // 获取错题的详细信息
  const wrongAnswersDetails = practiceResult.wrongAnswers.map((wrong) => {
    const question = questions.find((q) => q.id === wrong.questionId)
    return {
      question,
      wrongAnswer: wrong.userAnswer,
      correctAnswer: wrong.correctAnswer,
    }
  })

  const hasWrongAnswers = wrongAnswersDetails.length > 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-safe">
      {/* 顶部庆祝区域 */}
      <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 dark:from-indigo-700 dark:via-purple-700 dark:to-indigo-800 px-4 pt-8 pb-16 relative overflow-hidden">
        {/* 装饰性背景 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-lg mx-auto text-center">
          {/* 奖杯图标 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-4">
            <Trophy className="w-10 h-10 text-yellow-300" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            练习完成！
          </h1>
          <p className="text-indigo-100" style={{ fontFamily: 'Inter, sans-serif' }}>
            继续保持，每天进步一点点
          </p>
        </div>
      </div>

      {/* 主要统计卡片 */}
      <div className="max-w-lg mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          {/* 正确率环形图 */}
          <div className="flex justify-center mb-6">
            <AccuracyRing accuracy={accuracy} size={140} />
          </div>

          {/* 统计数据网格 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mb-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {practiceResult.correctAnswers}/{practiceResult.totalQuestions}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                正确题数
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl mb-2">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {practiceResult.score}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                得分
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl mb-2">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}`}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                用时
              </p>
            </div>
          </div>
        </div>

        {/* 错题回顾 */}
        {hasWrongAnswers && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                错题回顾
              </h3>
              <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                {wrongAnswersDetails.length} 道题
              </span>
            </div>

            <div className="space-y-3">
              {wrongAnswersDetails.slice(0, 3).map((detail, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {detail.question?.question}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-red-600 dark:text-red-400">你的答案：{detail.wrongAnswer}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-600 dark:text-emerald-400">正确：{detail.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onReviewWrongAnswers}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <BookOpen className="w-4 h-4" />
              查看全部错题
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={onRestartPractice}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <RotateCcw className="w-5 h-5" />
            再练一次
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onViewProgressStats}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold border-2 border-slate-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-black/20 transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <TrendingUp className="w-4 h-4" />
              查看统计
            </button>
            <button
              onClick={onBackToHome}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold border-2 border-slate-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-black/20 transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              完成返回
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
