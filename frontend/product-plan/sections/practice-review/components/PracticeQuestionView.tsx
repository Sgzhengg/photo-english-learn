import { useState } from 'react'
import { ChevronLeft, ChevronRight, SkipForward, Volume2, VolumeX, Check, X } from 'lucide-react'
import type { PracticeReviewProps as Props, PracticeQuestion } from '../types'

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
function QuestionTypeIcon({ type }: { type: Props['questions'][number]['type'] }) {
  const icons = {
    'fill-blank': <span className="text-lg">✏️</span>,
    'multiple-choice': <span className="text-lg">📝</span>,
    'dictation': <span className="text-lg">🎧</span>,
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

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = userAnswers.get(currentQuestion.id) || localAnswer
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return

    const isCorrect = currentAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase()

    setShowFeedback({
      correct: isCorrect,
      message: isCorrect ? '正确！' : `正确答案：${currentQuestion.correctAnswer}`,
    })

    // 延迟提交，让用户看到反馈
    setTimeout(() => {
      onSubmitAnswer(currentQuestion.id, currentAnswer)
      setLocalAnswer('')
      setShowFeedback(null)
    }, 1500)
  }

  const handleSkip = () => {
    onSkipQuestion(currentQuestion.id)
    setLocalAnswer('')
    setShowFeedback(null)
  }

  const handleAudioToggle = () => {
    if (isPlayingAudio) {
      onStopAudio()
    } else if (currentQuestion.audioUrl) {
      onPlayAudio(currentQuestion.audioUrl)
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
              <QuestionTypeIcon type={currentQuestion.type} />
              <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                {currentQuestion.type === 'fill-blank' && '填空题'}
                {currentQuestion.type === 'multiple-choice' && '选择题'}
                {currentQuestion.type === 'dictation' && '听写题'}
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
          <div className="mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              提示：{currentQuestion.hint}
            </p>
            {currentQuestion.type === 'dictation' && currentQuestion.phonetic && (
              <p className="text-lg text-slate-700 dark:text-slate-300 font-mono mb-3">
                {currentQuestion.phonetic}
              </p>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {currentQuestion.question}
          </h2>

          {/* 听写题音频播放按钮 */}
          {currentQuestion.type === 'dictation' && (
            <button
              onClick={handleAudioToggle}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isPlayingAudio ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              {isPlayingAudio ? '停止播放' : '播放音频'}
            </button>
          )}
        </div>

        {/* 答题区域 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          {currentQuestion.type === 'multiple-choice' ? (
            /* 选择题选项 */
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
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
                      {option.id}
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
