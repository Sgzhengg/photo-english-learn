import { Volume2, Bookmark, BookmarkCheck } from 'lucide-react'
import type { RecognizedWord } from '../types'

interface WordCardProps {
  word: RecognizedWord
  isHighlight?: boolean
  onPlayPronunciation?: (wordId: string) => void
  onSave?: (wordId: string) => void
  onUnsave?: (wordId: string) => void
}

export function WordCard({
  word,
  isHighlight = false,
  onPlayPronunciation,
  onSave,
  onUnsave,
}: WordCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${isHighlight
          ? 'border-lime-400 bg-lime-50 shadow-lg shadow-lime-200 dark:shadow-lime-900/20 dark:bg-lime-950/30 dark:border-lime-500'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-600'
        }
      `}
    >
      {/* 保存状态指示条 */}
      {word.isSaved && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
      )}

      <div className="flex items-center gap-4 p-4">
        {/* 单词主体 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-1">
            <h3
              className={`
                text-2xl font-bold tracking-tight transition-colors
                ${isHighlight
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-900 dark:text-slate-100'
                }
              `}
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {word.word}
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
              {word.phonetic}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            {word.definition}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 发音按钮 */}
          <button
            onClick={() => onPlayPronunciation?.(word.id)}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-all duration-200 active:scale-95"
            aria-label="播放发音"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* 保存/取消保存按钮 */}
          {word.isSaved ? (
            <button
              onClick={() => onUnsave?.(word.id)}
              className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-all duration-200 active:scale-95"
              aria-label="取消保存"
            >
              <BookmarkCheck className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => onSave?.(word.id)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-all duration-200 active:scale-95"
              aria-label="保存到生词库"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 高亮动画效果 */}
      {isHighlight && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-400/20 via-lime-300/10 to-lime-400/20 animate-pulse" />
        </div>
      )}
    </div>
  )
}
