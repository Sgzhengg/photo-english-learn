// =============================================================================
// Data Types
// =============================================================================

export type MasteryLevel = 'learning' | 'familiar' | 'mastered'

export interface WordExample {
  /** 例句（英文） */
  sentence: string
  /** 例句翻译（中文） */
  translation: string
  /** 来源照片 ID（如果有） */
  fromPhoto: string | null
}

export interface SourcePhoto {
  /** 来源照片 ID */
  id: string
  /** 照片缩略图 URL */
  thumbnailUrl: string
  /** 拍摄地点 */
  location: string
  /** 拍摄时间 */
  capturedAt: string
}

export interface LearningRecord {
  /** 添加到生词库的日期 */
  addedDate: string
  /** 复习次数 */
  reviewCount: number
  /** 掌握程度 */
  masteryLevel: MasteryLevel
  /** 最后复习日期 */
  lastReviewDate: string
}

export interface Word {
  /** 单词唯一标识 */
  id: string
  /** 英文单词 */
  word: string
  /** 音标 */
  phonetic: string
  /** 中文释义 */
  definition: string
  /** 词性 */
  partOfSpeech: string
  /** 例句列表 */
  examples: WordExample[]
  /** 发音音频 URL */
  pronunciationUrl: string
  /** 来源照片信息 */
  sourcePhoto: SourcePhoto
  /** 学习记录 */
  learningRecord: LearningRecord
  /** 关联的标签 ID 列表 */
  tags: string[]
}

export type TagType = 'preset' | 'custom'

export interface Tag {
  /** 标签唯一标识 */
  id: string
  /** 标签名称 */
  name: string
  /** 标签类型（预设/自定义） */
  type: TagType
  /** 标签颜色（用于 UI 显示） */
  color: string
}

export type ViewMode = 'list' | 'grid'

export type SortOption = 'addedDate' | 'reviewCount' | 'masteryLevel' | 'alphabetical'

// =============================================================================
// Component Props
// =============================================================================

export interface VocabularyLibraryProps {
  /** 所有单词列表 */
  words: Word[]
  /** 所有标签列表 */
  tags: Tag[]
  /** 当前视图模式 */
  viewMode: ViewMode
  /** 当前排序方式 */
  sortBy: SortOption
  /** 当前搜索关键词 */
  searchQuery: string
  /** 当前选中的标签筛选 */
  selectedTags: string[]
  /** 当用户切换视图模式时调用 */
  onViewModeChange?: (mode: ViewMode) => void
  /** 当用户改变排序方式时调用 */
  onSortChange?: (option: SortOption) => void
  /** 当用户输入搜索关键词时调用 */
  onSearchChange?: (query: string) => void
  /** 当用户点击标签筛选时调用 */
  onTagToggle?: (tagId: string) => void
  /** 当用户点击单词发音按钮时调用 */
  onPlayPronunciation?: (wordId: string) => void
  /** 当用户点击查看单词详情时调用 */
  onViewDetails?: (wordId: string) => void
  /** 当用户点击开始练习时调用 */
  onStartPractice?: (wordId: string) => void
  /** 当用户点击删除单词时调用 */
  onDeleteWord?: (wordId: string) => void
  /** 当用户创建自定义标签时调用 */
  onCreateTag?: (name: string, color: string) => void
  /** 当用户编辑标签时调用 */
  onEditTag?: (tagId: string, name: string, color: string) => void
  /** 当用户删除标签时调用 */
  onDeleteTag?: (tagId: string) => void
}
