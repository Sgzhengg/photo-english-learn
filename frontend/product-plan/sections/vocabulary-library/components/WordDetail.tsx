import { Volume2, ArrowLeft, BookOpen, TrendingUp, Calendar, Trash2, X } from 'lucide-react'
import type { Word } from '../types'

interface WordDetailProps {
  word: Word
  onBack?: () => void
  onPlayPronunciation?: (wordId: string) => void
  onStartPractice?: (wordId: string) => void
  onDeleteWord?: (wordId: string) => void
}

export function WordDetail({
  word,
  onBack,
  onPlayPronunciation,
  onStartPractice,
  onDeleteWord,
}: WordDetailProps) {
  // 掌握程度的颜色和标签
  const masteryConfig = {
    learning: { label: '学习中', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    familiar: { label: '熟悉', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    mastered: { label: '已掌握', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' },
  }[word.learningRecord.masteryLevel]

  return (
    <div className="space-y-6 px-4 pb-6 max-w-2xl mx-auto">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">返回</span>
        </button>

        <button
          onClick={() => onDeleteWord?.(word.id)}
          className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
          aria-label="删除单词"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* 单词主要信息卡片 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* 单词头部 */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1
                className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {word.word}
              </h1>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg text-slate-600 dark:text-slate-400 font-mono">
                  {word.phonetic}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-medium">
                  {word.partOfSpeech}
                </span>
              </div>
              <p className="text-xl text-slate-700 dark:text-slate-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                {word.definition}
              </p>
            </div>

            {/* 发音按钮 */}
            <button
              onClick={() => onPlayPronunciation?.(word.id)}
              className="flex-shrink-0 p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="播放发音"
            >
              <Volume2 className="w-6 h-6" fill="currentColor" />
            </button>
          </div>

          {/* 标签 */}
          {word.tags && word.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {word.tags.map((tagId) => {
                // 这里应该从 tags prop 中查找标签信息
                // 为了简化，我们直接显示 tagId
                return (
                  <span
                    key={tagId}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {tagId}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* 学习记录 */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <TrendingUp className="w-5 h-5" />
              学习记录
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${masteryConfig.color}`} style={{ fontFamily: 'Inter, sans-serif' }}>
              {masteryConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                <Calendar className="w-4 h-4" />
                添加日期
              </div>
              <p className="text-slate-900 dark:text-slate-100 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {new Date(word.learningRecord.addedDate).toLocaleDateString('zh-CN')}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                <BookOpen className="w-4 h-4" />
                复习次数
              </div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {word.learningRecord.reviewCount}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              最后复习时间
            </p>
            <p className="text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Inter, sans-serif' }}>
              {new Date(word.learningRecord.lastReviewDate).toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* 开始练习按钮 */}
          <button
            onClick={() => onStartPractice?.(word.id)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/20 active:scale-95"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <BookOpen className="w-5 h-5" />
            开始练习这个单词
          </button>
        </div>
      </div>

      {/* 来源照片 */}
      {word.sourcePhoto && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              来源照片
            </h3>
          </div>
          <div className="p-4 flex items-center gap-4">
            <img
              src={word.sourcePhoto.thumbnailUrl}
              alt={word.sourcePhoto.location}
              className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Inter, sans-serif' }}>
                {word.sourcePhoto.location}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                拍摄于 {new Date(word.sourcePhoto.capturedAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 例句列表 */}
      {word.examples && word.examples.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              例句 ({word.examples.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {word.examples.map((example, index) => (
              <div key={index} className="p-5">
                <p className="text-slate-900 dark:text-slate-100 text-base leading-relaxed mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {example.sentence}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {example.translation}
                </p>
                {example.fromPhoto && (
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      来自照片场景
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
