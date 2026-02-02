import { Camera, Loader2 } from 'lucide-react'
import type { PhotoCaptureProps } from '../types'
import { WordCard } from './WordCard'
import { SceneSentence } from './SceneSentence'

export function PhotoCaptureResult({
  currentPhoto,
  isCapturing,
  currentWordIndex,
  isPlaying,
  onCapture,
  onPlayWordPronunciation,
  onSaveWord,
  onUnsaveWord,
}: PhotoCaptureProps) {
  // 拍照/处理中状态
  if (isCapturing || !currentPhoto || currentPhoto.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            {currentPhoto?.status === 'processing' ? (
              <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            ) : (
              <Camera className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          {/* 脉冲动画 */}
          <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {currentPhoto?.status === 'processing' ? '正在识别...' : '准备拍照'}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          {currentPhoto?.status === 'processing'
            ? 'AI 正在分析图片内容，请稍候...'
            : '点击下方按钮开始拍照识别'
          }
        </p>
        {onCapture && (
          <button
            onClick={onCapture}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/20 active:scale-95"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Camera className="w-5 h-5" />
            开始拍照
          </button>
        )}
      </div>
    )
  }

  // 识别结果页面
  return (
    <div className="space-y-6 px-4 pb-6 max-w-2xl mx-auto">
      {/* 照片预览 */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
        <img
          src={currentPhoto.imageUrl}
          alt={currentPhoto.location}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {currentPhoto.location}
              </p>
              <p className="text-white/80 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                识别出 {currentPhoto.recognizedWords.length} 个单词
              </p>
            </div>
            <div className="px-3 py-1.5 bg-lime-400 rounded-full">
              <span className="text-xs font-semibold text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                已完成
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 单词列表标题 */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          识别出的单词
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          点击保存按钮将单词添加到生词库
        </p>
      </div>

      {/* 单词卡片列表 */}
      <div className="space-y-3">
        {currentPhoto.recognizedWords.map((word) => {
          const isHighlight = isPlaying && word.positionInSentence === currentWordIndex
          return (
            <WordCard
              key={word.id}
              word={word}
              isHighlight={isHighlight}
              onPlayPronunciation={onPlayWordPronunciation}
              onSave={onSaveWord}
              onUnsave={onUnsaveWord}
            />
          )
        })}
      </div>

      {/* 场景描述句子 */}
      {currentPhoto.sceneDescription && (
        <SceneSentence
          photo={currentPhoto}
          currentWordIndex={currentWordIndex}
          isPlaying={isPlaying}
        />
      )}
    </div>
  )
}
