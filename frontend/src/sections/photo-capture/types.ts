// =============================================================================
// Data Types
// =============================================================================

export interface RecognizedWord {
  /** 单词唯一标识 */
  id: string
  /** 英文单词 */
  word: string
  /** 音标 */
  phonetic: string
  /** 中文释义 */
  definition: string
  /** 发音音频 URL */
  pronunciationUrl: string
  /** 是否已保存到生词库 */
  isSaved: boolean
  /** 在场景句子中的单词位置索引（从0开始），-1 表示不在句子中 */
  positionInSentence: number
}

export type PhotoStatus = 'completed' | 'processing' | 'failed'

export interface Photo {
  /** 照片唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 原始图片 URL */
  imageUrl: string
  /** 缩略图 URL */
  thumbnailUrl: string
  /** 拍摄时间 */
  capturedAt: string
  /** 拍摄地点 */
  location: string
  /** 识别状态 */
  status: PhotoStatus
  /** 识别出的单词列表 */
  recognizedWords: RecognizedWord[]
  /** 场景描述句子（英文） */
  sceneDescription: string
  /** 场景描述句子（中文翻译） */
  sceneTranslation: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface PhotoCaptureProps {
  /** 当前显示的照片识别记录 */
  currentPhoto: Photo | null
  /** 是否正在拍照 */
  isCapturing: boolean
  /** 场景句子 TTS 当前播放的单词位置索引 */
  currentWordIndex: number
  /** TTS 是否正在播放 */
  isPlaying: boolean
  /** 当用户点击拍照按钮时调用 */
  onCapture?: () => void
  /** 当用户点击单词发音按钮时调用 */
  onPlayWordPronunciation?: (wordId: string) => void
  /** 当用户点击保存单词按钮时调用 */
  onSaveWord?: (wordId: string) => void
  /** 当用户点击取消保存单词按钮时调用 */
  onUnsaveWord?: (wordId: string) => void
}
