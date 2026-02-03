import { Calendar, Clock, TrendingUp, RotateCcw, Info } from 'lucide-react'
import type { ReviewScheduleItem } from '@/../product/sections/practice-review/types'

interface ReviewScheduleProps {
  reviewSchedule: ReviewScheduleItem[]
  onBackToHome?: () => void
}

// 复习间隔标签
function IntervalBadge({ days }: { days: number }) {
  const config = {
    0: { label: '今天', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    1: { label: '1天后', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    2: { label: '2天后', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  }[days] || {
    label: `${days}天后`,
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {config.label}
    </span>
  )
}

// 难度因子指示器
function EaseFactorIndicator({ easeFactor }: { easeFactor: number }) {
  const percentage = Math.min(((easeFactor - 1.3) / (2.7 - 1.3)) * 100, 100)

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            easeFactor >= 2.5
              ? 'bg-emerald-500'
              : easeFactor >= 2.0
              ? 'bg-blue-500'
              : easeFactor >= 1.8
              ? 'bg-amber-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-600 dark:text-slate-400 font-mono min-w-[3rem] text-right">
        {easeFactor.toFixed(1)}
      </span>
    </div>
  )
}

export function ReviewSchedule({ reviewSchedule, onBackToHome }: ReviewScheduleProps) {
  // 按复习日期分组
  const groupedSchedule = reviewSchedule.reduce((acc, item) => {
    const date = new Date(item.nextReviewDate).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, ReviewScheduleItem[]>)

  // 按日期排序
  const sortedDates = Object.keys(groupedSchedule).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  )

  // 统计信息
  const today = new Date().toDateString()
  const todayCount = reviewSchedule.filter(item =>
    new Date(item.nextReviewDate).toDateString() === today
  ).length
  const upcomingCount = reviewSchedule.length - todayCount
  const avgEaseFactor = reviewSchedule.reduce((sum, item) => sum + item.easeFactor, 0) / reviewSchedule.length

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
              复习日程
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              基于间隔重复算法的智能复习计划
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-indigo-100 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                今日待复习
              </p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {todayCount}
              </p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                即将到来
              </p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {upcomingCount}
              </p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                平均难度因子
              </p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {avgEaseFactor.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* 算法说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800/50">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                艾宾浩斯遗忘曲线复习计划
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                基于艾宾浩斯遗忘曲线理论，在遗忘临界点进行复习，提高记忆效率。
              </p>
              <div className="grid grid-cols-5 gap-1 mt-2">
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-blue-900 dark:text-blue-300">5分钟</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400">第1次</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-blue-900 dark:text-blue-300">30分钟</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400">第2次</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-blue-900 dark:text-blue-300">12小时</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400">第3次</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-blue-900 dark:text-blue-300">1天</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400">第4次</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-blue-900 dark:text-blue-300">2天</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400">第5次</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 mt-1">
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-blue-900 dark:text-blue-300">3天</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400">第6次</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-blue-900 dark:text-blue-300">7天</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400">第7次</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-blue-900 dark:text-blue-300">14天</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400">第8次</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-blue-900 dark:text-blue-300">30天</div>
                  <div className="text-[9px] text-blue-600 dark:text-blue-400">第9次</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 复习日程列表 */}
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const items = groupedSchedule[date]
            const isToday = date === today
            const isPast = new Date(date) < new Date(today)

            return (
              <div key={date}>
                {/* 日期标题 */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className={`w-4 h-4 ${isToday ? 'text-amber-600 dark:text-amber-400' : isPast ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                  <h3 className={`text-sm font-semibold ${isToday ? 'text-amber-700 dark:text-amber-300' : isPast ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'}`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {isToday ? '今天' : isPast ? '已过期' : new Date(date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
                  </h3>
                  {isToday && (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
                      今日
                    </span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-500 ml-auto">
                    {items.length} 个单词
                  </span>
                </div>

                {/* 单词卡片列表 */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {items.map((item) => (
                    <div
                      key={item.wordId}
                      className={`p-4 flex items-start gap-4 ${
                        items.indexOf(item) < items.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''
                      }`}
                    >
                      {/* 单词信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                            {item.word}
                          </h4>
                          <IntervalBadge days={item.intervalDays} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                                复习次数
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                              {item.reviewCount} 次
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                                难度因子
                              </span>
                            </div>
                            <EaseFactorIndicator easeFactor={item.easeFactor} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* 空状态 */}
        {reviewSchedule.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              暂无复习计划
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
