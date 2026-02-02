import { Search, List, Grid2, TrendingUp, Clock, ArrowUpDown, Volume2, Eye, Play, Trash2 } from 'lucide-react'
import type { VocabularyLibraryProps as Props, Word, Tag } from '../types'

interface VocabularyListProps {
  words: Word[]
  tags: Tag[]
  viewMode: 'list' | 'grid'
  sortBy: string
  searchQuery: string
  selectedTags: string[]
  onViewModeChange?: (mode: 'list' | 'grid') => void
  onSortChange?: (option: string) => void
  onSearchChange?: (query: string) => void
  onTagToggle?: (tagId: string) => void
  onPlayPronunciation?: (wordId: string) => void
  onViewDetails?: (wordId: string) => void
  onStartPractice?: (wordId: string) => void
  onDeleteWord?: (wordId: string) => void
}

// 掌握程度标签组件
function MasteryBadge({ level }: { level: string }) {
  const config = {
    learning: { label: '学习中', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    familiar: { label: '熟悉', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    mastered: { label: '已掌握', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' },
  }[level as keyof typeof config] || config.learning

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {config.label}
    </span>
  )
}

// 标签筛选器组件
function TagFilter({ tags, selectedTags, onTagToggle }: { tags: Tag[], selectedTags: string[], onTagToggle?: (tagId: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id)
        return (
          <button
            key={tag.id}
            onClick={() => onTagToggle?.(tag.id)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
              ${isSelected
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }
            `}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}

// 列表视图的单词行组件
function WordRow({ word, onPlayPronunciation, onViewDetails, onStartPractice, onDeleteWord }: {
  word: Word
  onPlayPronunciation?: (wordId: string) => void
  onViewDetails?: (wordId: string) => void
  onStartPractice?: (wordId: string) => void
  onDeleteWord?: (wordId: string) => void
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* 单词主要信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {word.word}
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
              {word.phonetic}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            {word.definition}
          </p>
          <div className="flex items-center gap-2">
            <MasteryBadge level={word.learningRecord.masteryLevel} />
            <span className="text-xs text-slate-500 dark:text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              复习 {word.learningRecord.reviewCount} 次
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onPlayPronunciation?.(word.id)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label="播放发音"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewDetails?.(word.id)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label="查看详情"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onStartPractice?.(word.id)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-lime-100 dark:hover:bg-lime-900/30 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
            aria-label="开始练习"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteWord?.(word.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="删除单词"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 网格视图的单词卡片组件
function WordCard({ word, onPlayPronunciation, onViewDetails, onStartPractice, onDeleteWord }: {
  word: Word
  onPlayPronunciation?: (wordId: string) => void
  onViewDetails?: (wordId: string) => void
  onStartPractice?: (wordId: string) => void
  onDeleteWord?: (wordId: string) => void
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200">
      {/* 单词头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {word.word}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mb-2">
            {word.phonetic}
          </p>
          <MasteryBadge level={word.learningRecord.masteryLevel} />
        </div>
        <button
          onClick={() => onPlayPronunciation?.(word.id)}
          className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          aria-label="播放发音"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* 释义 */}
      <p className="text-slate-700 dark:text-slate-300 text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        {word.definition}
      </p>

      {/* 来源照片 */}
      {word.sourcePhoto && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <img
            src={word.sourcePhoto.thumbnailUrl}
            alt={word.sourcePhoto.location}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <span className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            {word.sourcePhoto.location}
          </span>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewDetails?.(word.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <Eye className="w-4 h-4" />
          详情
        </button>
        <button
          onClick={() => onStartPractice?.(word.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-lime-500 hover:bg-lime-600 text-slate-900 rounded-lg text-sm font-medium transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <Play className="w-4 h-4" fill="currentColor" />
          练习
        </button>
        <button
          onClick={() => onDeleteWord?.(word.id)}
          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          aria-label="删除单词"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function VocabularyList({
  words,
  tags,
  viewMode,
  sortBy,
  searchQuery,
  selectedTags,
  onViewModeChange,
  onSortChange,
  onSearchChange,
  onTagToggle,
  onPlayPronunciation,
  onViewDetails,
  onStartPractice,
  onDeleteWord,
}: VocabularyListProps) {
  return (
    <div className="space-y-4 px-4 pb-6 max-w-6xl mx-auto">
      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="搜索单词或释义..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* 左侧：视图切换和排序 */}
        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange?.('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              aria-label="列表视图"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              aria-label="网格视图"
            >
              <Grid2 className="w-5 h-5" />
            </button>
          </div>

          {/* 排序选择器 */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value="addedDate">🕐 添加时间</option>
            <option value="reviewCount">📊 复习次数</option>
            <option value="masteryLevel">📈 掌握程度</option>
            <option value="alphabetical">🔤 字母顺序</option>
          </select>
        </div>

        {/* 右侧：单词统计 */}
        <div className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          共 {words.length} 个单词
        </div>
      </div>

      {/* 标签筛选 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          标签筛选
        </h3>
        <TagFilter tags={tags} selectedTags={selectedTags} onTagToggle={onTagToggle} />
      </div>

      {/* 单词列表/网格 */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {words.map((word) => (
            <WordRow
              key={word.id}
              word={word}
              onPlayPronunciation={onPlayPronunciation}
              onViewDetails={onViewDetails}
              onStartPractice={onStartPractice}
              onDeleteWord={onDeleteWord}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              onPlayPronunciation={onPlayPronunciation}
              onViewDetails={onViewDetails}
              onStartPractice={onStartPractice}
              onDeleteWord={onDeleteWord}
            />
          ))}
        </div>
      )}
    </div>
  )
}
