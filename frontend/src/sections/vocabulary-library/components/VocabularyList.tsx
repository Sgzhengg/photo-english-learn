import { Search, List, Grid, Volume2, Eye, Play, Trash2, Plus, X } from 'lucide-react'
import type { Word, Tag } from '@/../product/sections/vocabulary-library/types'

interface VocabularyListProps {
  words: Word[]
  tags: Tag[]
  viewMode: 'list' | 'grid'
  sortBy: string
  searchQuery: string
  selectedTags: string[]
  isCreatingTag?: boolean
  newTagName?: string
  onViewModeChange?: (mode: 'list' | 'grid') => void
  onSortChange?: (option: string) => void
  onSearchChange?: (query: string) => void
  onTagToggle?: (tagId: string) => void
  onCreateTag?: () => void
  onNewTagNameChange?: (name: string) => void
  onSubmitNewTag?: () => void
  onCancelNewTag?: () => void
  onDeleteTag?: (tagId: string) => void
  onPlayPronunciation?: (wordId: string) => void
  onViewDetails?: (wordId: string) => void
  onStartPractice?: (wordId: string) => void
  onDeleteWord?: (wordId: string) => void
}

// 掌握程度指示点组件
function MasteryBadge({ level }: { level: string }) {
  const configMap = {
    learning: { color: 'bg-red-500', label: '学习中' },
    familiar: { label: '熟悉', color: 'bg-yellow-500' },
    mastered: { label: '已掌握', color: 'bg-green-500' },
  }
  const config = configMap[level as keyof typeof configMap] || configMap.learning

  return (
    <div
      className={`w-2 h-2 rounded-full ${config.color}`}
      title={config.label}
    />
  )
}

// 标签筛选器组件
function TagFilter({
  tags,
  selectedTags,
  isCreatingTag,
  newTagName,
  onTagToggle,
  onCreateTag,
  onNewTagNameChange,
  onSubmitNewTag,
  onCancelNewTag,
  onDeleteTag,
}: {
  tags: Tag[]
  selectedTags: string[]
  isCreatingTag?: boolean
  newTagName?: string
  onTagToggle?: (tagId: string) => void
  onCreateTag?: () => void
  onNewTagNameChange?: (name: string) => void
  onSubmitNewTag?: () => void
  onCancelNewTag?: () => void
  onDeleteTag?: (tagId: string) => void
}) {
  return (
    <div className="space-y-3">
      {/* 现有标签 */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id)
          return (
            <div
              key={tag.id}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <button
                onClick={() => onTagToggle?.(tag.id)}
                className="flex-1 text-left"
              >
                {tag.name}
              </button>
              <button
                onClick={() => onDeleteTag?.(tag.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-red-600 dark:hover:text-red-400"
                aria-label="删除标签"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>

      {/* 创建新标签 */}
      {isCreatingTag ? (
        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <input
            type="text"
            placeholder="输入标签名称..."
            value={newTagName}
            onChange={(e) => onNewTagNameChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubmitNewTag?.()
              } else if (e.key === 'Escape') {
                onCancelNewTag?.()
              }
            }}
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ fontFamily: 'Inter, sans-serif' }}
            autoFocus
          />
          <button
            onClick={onSubmitNewTag}
            disabled={!newTagName?.trim()}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            添加
          </button>
          <button
            onClick={onCancelNewTag}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={onCreateTag}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <Plus className="w-3 h-3" />
          创建标签
        </button>
      )}
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-2.5 hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200">
      {/* 单词头部 */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {word.word}
          </h3>
          <MasteryBadge level={word.learningRecord.masteryLevel} />
        </div>
        <button
          onClick={() => onPlayPronunciation?.(word.id)}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors shrink-0"
          aria-label="播放发音"
        >
          <Volume2 className="w-3 h-3" />
        </button>
      </div>

      {/* 释义 */}
      <p className="text-slate-700 dark:text-slate-300 text-[10px] mb-1.5 leading-snug line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        {word.definition}
      </p>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => onViewDetails?.(word.id)}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          aria-label="查看详情"
        >
          <Eye className="w-3 h-3" />
        </button>
        <button
          onClick={() => onStartPractice?.(word.id)}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-lime-100 dark:hover:bg-lime-900/30 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
          aria-label="开始练习"
        >
          <Play className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDeleteWord?.(word.id)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="删除单词"
        >
          <Trash2 className="w-3 h-3" />
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
  isCreatingTag,
  newTagName,
  onViewModeChange,
  onSortChange,
  onSearchChange,
  onTagToggle,
  onCreateTag,
  onNewTagNameChange,
  onSubmitNewTag,
  onCancelNewTag,
  onDeleteTag,
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
              <Grid className="w-5 h-5" />
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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            标签筛选
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            {tags.length} 个标签
          </span>
        </div>
        <TagFilter
          tags={tags}
          selectedTags={selectedTags}
          isCreatingTag={isCreatingTag}
          newTagName={newTagName}
          onTagToggle={onTagToggle}
          onCreateTag={onCreateTag}
          onNewTagNameChange={onNewTagNameChange}
          onSubmitNewTag={onSubmitNewTag}
          onCancelNewTag={onCancelNewTag}
          onDeleteTag={onDeleteTag}
        />
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
