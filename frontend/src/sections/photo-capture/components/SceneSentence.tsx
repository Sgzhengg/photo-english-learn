import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Star, Volume2, Loader2 } from 'lucide-react'
import type { Photo, RecognizedWord } from '../types'
import { asrApi, type PronunciationScore } from '@/lib/api'

interface SceneSentenceProps {
  photo: Photo
  currentWordIndex: number
  isPlaying: boolean
}

/**
 * 将句子分割成单词数组，并标记每个单词的位置
 */
function splitSentenceIntoWords(sentence: string, recognizedWords: RecognizedWord[], currentWordIndex: number) {
  const words = sentence.split(/(\s+)/)
  let currentIndex = 0

  return words.map((word, _i) => {
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
}: SceneSentenceProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [recordedText, setRecordedText] = useState('')
  const [score, setScore] = useState<PronunciationScore | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimeoutRef = useRef<number | null>(null)

  // 清理录音定时器
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }
    }
  }, [])

  // 播放原句
  const handlePlayOriginal = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(photo.sceneDescription)
      utterance.lang = 'en-US'
      utterance.rate = 0.9

      utterance.onend = () => {
        setIsPlayingOriginal(false)
      }

      setIsPlayingOriginal(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  // 开始录音
  const handleStartRecording = async () => {
    setError(null)
    setRecordedText('')
    setScore(null)

    try {
      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // 创建 MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // 收集音频数据
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // 录音停止时的处理
      mediaRecorder.onstop = async () => {
        setIsRecording(false)

        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop())

        // 如果有录音数据，发送到后端进行评分
        if (audioChunksRef.current.length > 0) {
          await evaluatePronunciation()
        }
      }

      // 开始录音
      mediaRecorder.start()
      setIsRecording(true)

      // 30秒后自动停止录音
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
      }, 30000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('无法访问麦克风。请确保已授予麦克风权限。')
      setIsRecording(false)
    }
  }

  // 停止录音
  const handleStopRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  // 评估发音
  const evaluatePronunciation = async () => {
    setIsEvaluating(true)
    setError(null)

    try {
      // 创建音频 Blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })

      // 调用后端 API 进行发音评估
      const result = await asrApi.evaluatePronunciation(
        audioFile,
        photo.sceneDescription,
        'en-US'
      )

      if (result.success && result.data) {
        setRecordedText(result.data.recorded_text)
        setScore(result.data.score)
      } else {
        setError(result.error || '发音评估失败，请重试。')
      }
    } catch (err) {
      console.error('Error evaluating pronunciation:', err)
      setError('发音评估失败，请检查网络连接后重试。')
    } finally {
      setIsEvaluating(false)
    }
  }

  const words = splitSentenceIntoWords(photo.sceneDescription, photo.recognizedWords, currentWordIndex)

  if (!photo.sceneDescription) {
    return null
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* 标题栏 */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            场景描述
          </h3>
          {score && (
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-600" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                {score.overall}分
              </span>
            </div>
          )}
        </div>
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

        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 跟读录音区域 */}
        {recordedText && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-2 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              您的跟读：
            </p>
            <p className="text-base text-slate-900 dark:text-slate-100 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              "{recordedText}"
            </p>

            {score && (
              <div className="space-y-2">
                {/* 评分详情 */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">准确度</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{score.accuracy}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">流利度</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{score.fluency}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">完整度</p>
                    <p className="text-lg font-bold text-lime-600 dark:text-lime-400">{score.completeness}%</p>
                  </div>
                </div>

                {/* 总分和反馈 */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{score.feedback}</p>
                  </div>
                  <button
                    onClick={() => {
                      setScore(null)
                      setRecordedText('')
                      setError(null)
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    再练一次
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 录音状态指示 */}
        {isRecording && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-700 dark:text-red-400 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              正在录音中...
            </span>
          </div>
        )}

        {/* 评估中状态指示 */}
        {isEvaluating && (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <span className="text-sm text-indigo-700 dark:text-indigo-400 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              正在评估发音...
            </span>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex flex-col gap-3">
          {/* 第一行：播放和录音按钮 */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* 播放原句 */}
            <button
              onClick={handlePlayOriginal}
              disabled={isPlayingOriginal || isRecording || isEvaluating}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Volume2 className="w-4 h-4" />
              {isPlayingOriginal ? '播放中...' : '听原句'}
            </button>

            {/* 录音按钮 */}
            {!isRecording && !isEvaluating ? (
              <button
                onClick={handleStartRecording}
                disabled={isPlayingOriginal}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Mic className="w-4 h-4" />
                开始跟读
              </button>
            ) : isRecording ? (
              <button
                onClick={handleStopRecording}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/20 active:scale-95"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Square className="w-4 h-4" fill="currentColor" />
                停止录音
              </button>
            ) : (
              <button
                disabled
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-300 text-slate-500 rounded-xl font-medium cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                评估中...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
