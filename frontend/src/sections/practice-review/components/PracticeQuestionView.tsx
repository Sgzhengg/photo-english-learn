import { useState, useRef } from 'react'
import { ChevronRight, SkipForward, Volume2, VolumeX, Check, X, Eye, EyeOff } from 'lucide-react'
import type { PracticeQuestion } from '@/../product/sections/practice-review/types'

interface PracticeQuestionViewProps {
  questions: PracticeQuestion[]
  currentQuestionIndex: number
  userAnswers: Map<string, string>
  isPlayingAudio: boolean
  onSubmitAnswer: (questionId: string, answer: string) => void
  onSkipQuestion: (questionId: string) => void
  onPlayAudio: (audioUrl: string) => void
  onStopAudio: () => void
}

// 题型图标
function QuestionTypeIcon({ type }: { type: 'fill-blank' | 'spelling' | 'listening' }) {
  const icons = {
    'fill-blank': <span className="text-lg">✏️</span>,
    'spelling': <span className="text-lg">⌨️</span>,
    'listening': <span className="text-lg">🎧</span>,
  }
  return icons[type]
}

export function PracticeQuestionView({
  questions,
  currentQuestionIndex,
  userAnswers,
  isPlayingAudio,
  onSubmitAnswer,
  onSkipQuestion,
  onPlayAudio,
  onStopAudio,
}: PracticeQuestionViewProps) {
  const [localAnswer, setLocalAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [showHint, setShowHint] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = userAnswers.get(currentQuestion.id) || localAnswer
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const displayQuestion = currentQuestion.question

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return

    const isCorrect = currentAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase()

    setShowFeedback({
      correct: isCorrect,
      message: isCorrect ? '正确！' : `正确答案：${currentQuestion.correctAnswer}`,
    })

    // Submit answer immediately - parent will handle the delay and navigation
    onSubmitAnswer(currentQuestion.id, currentAnswer)

    // Clear feedback and local answer after delay
    setTimeout(() => {
      setLocalAnswer('')
      setShowFeedback(null)
      setShowHint(false) // Reset hint state
    }, 1500)
  }

  const handleSkip = () => {
    onSkipQuestion(currentQuestion.id)
    setLocalAnswer('')
    setShowFeedback(null)
    setShowHint(false) // Reset hint state
  }

  const handleAudioToggle = () => {
    if (isPlayingAudio) {
      // Stop audio
      window.speechSynthesis.cancel()
      onStopAudio()
    } else {
      // Play audio using Web Speech API
      // Use the correct answer as the word to speak
      const wordToSpeak = currentQuestion.correctAnswer || ''

      if (wordToSpeak && 'speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(wordToSpeak)
        utterance.lang = 'en-US'
        utterance.rate = 0.8  // Slightly slower for dictation
        utterance.pitch = 1
        utterance.volume = 1

        utterance.onstart = () => {
          console.log('Speech started for:', wordToSpeak)
        }

        utterance.onend = () => {
          console.log('Speech ended for:', wordToSpeak)
          onStopAudio()
        }

        utterance.onerror = (event) => {
          console.error('Speech error:', event.error)
          onStopAudio()
        }

        speechRef.current = utterance

        // Wait a small delay to ensure voices are loaded
        setTimeout(() => {
          window.speechSynthesis.speak(utterance)
        }, 100)

        onPlayAudio(currentQuestion.audioUrl || '')
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* 顶部进度条 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              题目 {currentQuestionIndex + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-1">
              <QuestionTypeIcon type={currentQuestion.type as any} />
              <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                {currentQuestion.type === 'fill-blank' && '填空题'}
                {currentQuestion.type === 'spelling' && '拼写题'}
                {currentQuestion.type === 'listening' && '听音题'}
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* 题目卡片 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {displayQuestion}
          </h2>

          {/* 可展开的提示（适用于所有题型） */}
          {currentQuestion.hint && (
            <div className="mt-3">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {showHint ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>隐藏提示</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>查看提示</span>
                  </>
                )}
              </button>

              {showHint && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                    💡 {currentQuestion.hint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 听音题提示 */}
          {currentQuestion.type === 'listening' && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200" style={{ fontFamily: 'Inter, sans-serif' }}>
                💡 提示：根据音标选择正确的单词
              </p>
            </div>
          )}
        </div>

        {/* 答题区域 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          {currentQuestion.type === 'listening' ? (
            /* 听音题选项（选择题形式） */
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => setLocalAnswer(option.text)}
                  disabled={!!showFeedback}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                    currentAnswer === option.text
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  } ${showFeedback ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {index + 1}
                    </span>
                    <span className="text-lg">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* 填空题和听写题输入框 */
            <div>
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setLocalAnswer(e.target.value)}
                disabled={!!showFeedback}
                placeholder="输入你的答案..."
                className={`w-full px-5 py-4 text-lg rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-all ${
                  showFeedback
                    ? 'border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-70'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
                onKeyDown={(e) => e.key === 'Enter' && !showFeedback && handleSubmit()}
              />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                按 Enter 键快速提交
              </p>
            </div>
          )}

          {/* 反馈提示 */}
          {showFeedback && (
            <div
              className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                showFeedback.correct
                  ? 'bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}
            >
              {showFeedback.correct ? <Check className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
              <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {showFeedback.message}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-4 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={handleSkip}
            disabled={showFeedback !== null}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <SkipForward className="w-5 h-5" />
            跳过
          </button>
          <button
            onClick={handleSubmit}
            disabled={!currentAnswer.trim() || showFeedback !== null}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                下一题
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                完成练习
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
