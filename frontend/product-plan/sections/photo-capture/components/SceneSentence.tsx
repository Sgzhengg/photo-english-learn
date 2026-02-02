import { Play, Pause, SkipForward } from 'lucide-react'
import type { Photo, RecognizedWord } from '../types'

interface SceneSentenceProps {
  photo: Photo
  currentWordIndex: number
  isPlaying: boolean
  onPlay?: (photoId: string) => void
  onPause?: () => void
  onStop?: () => void
}

/**
 * 将句子分割成单词数组，并标记每个单词的位置
 */
function splitSentenceIntoWords(sentence: string, recognizedWords: RecognizedWord[]) {
  const words = sentence.split(/(\s+)/)
  let currentIndex = 0

  return words.map((word, i) => {
    // 检查是否是被识别的单词
    const recognizedWord = recognizedWords.find(
      rw => rw.positionInSentence === currentIndex && word.toLowerCase().includes(rw.word.toLowerCase())
    )

    if (recognizedWord && !/^\s+$/.test(word)) {
      currentIndex++
    }

    return {
      text: word,
      isRecognized: !!recognizedWord,
      isCurrentIndex: recognizedWord?.positionInSentence === currentWordIndex,
    }
  })
}

export function SceneSentence({
  photo,
  currentWordIndex,
  isPlaying,
  onPlay,
  onPause,
  onStop,
}: SceneSentenceProps) {
  if (!photo.sceneDescription) {
    return null
  }

  const words = splitSentenceIntoWords(photo.sceneDescription, photo.recognizedWords)

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* 标题栏 */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          场景描述
        </h3>
      </div>

      {/* 句子内容 */}
      <div className="p-5 space-y-4">
        {/* 英文句子 */}
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          {words.map((wordObj, i) => {
            const isHighlight = wordObj.isRecognized && wordObj.isCurrentIndex && isPlaying

            return (
              <span
                key={i}
                className={`
                  transition-all duration-300
                  ${wordObj.isRecognized
                    ? 'px-2 py-0.5 rounded-lg cursor-pointer ' +
                      (isHighlight
                        ? 'bg-lime-400 text-slate-900 font-semibold shadow-lg shadow-lime-200 dark:shadow-lime-900/20'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50')
                    : 'text-slate-700 dark:text-slate-300'
                  }
                `}
              >
                {wordObj.text}
              </span>
            )
          })}
        </div>

        {/* 中文翻译 */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          {photo.sceneTranslation}
        </p>

        {/* 播放控制 */}
        <div className="flex items-center gap-3 pt-2">
          {!isPlaying ? (
            <button
              onClick={() => onPlay?.(photo.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/20 active:scale-95"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Play className="w-5 h-5" fill="currentColor" />
              播放朗读
            </button>
          ) : (
            <>
              <button
                onClick={() => onPause?.()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/20 active:scale-95"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Pause className="w-5 h-5" fill="currentColor" />
                暂停
              </button>
              <button
                onClick={() => onStop?.()}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 rounded-xl font-medium transition-all duration-200 active:scale-95"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <SkipForward className="w-4 h-4" />
                停止
              </button>
            </>
          )}

          {/* 播放进度指示 */}
          {isPlaying && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                正在朗读...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
