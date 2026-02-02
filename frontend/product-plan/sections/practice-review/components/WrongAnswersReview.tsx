import { useState } from 'react'
import { RotateCcw, X, Check, Volume2, VolumeX, BookOpen, TrendingUp, CheckCircle2 } from 'lucide-react'
import type { PracticeReviewProps as Props, WrongAnswer } from '../types'

interface WrongAnswersReviewProps {
  wrongAnswersQueue: WrongAnswer[]
  currentWrongIndex: number
  onReviewWrongAnswer?: (wordId: string, correct: boolean) => void
  onBackToHome?: () => void
}

// 错题卡片
function WrongAnswerCard({ wrongAnswer, onReview }: { wrongAnswer: WrongAnswer; onReview: (correct: boolean) => void }) {
  const [userAnswer, setUserAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean } | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const handleSubmit = () => {
    if (!userAnswer.trim()) return

    const isCorrect = userAnswer.toLowerCase().trim() === wrongAnswer.word.toLowerCase()

    setShowFeedback({ correct: isCorrect })

    // 延迟进入下一题
    setTimeout(() => {
      onReview(isCorrect)
      setUserAnswer('')
      setShowFeedback(null)
    }, isCorrect ? 1000 : 2000)
  }

  const handleAudioToggle = () => {
    setIsPlayingAudio(!isPlayingAudio)
    // 实际应用中这里会播放 TTS
    setTimeout(() => setIsPlayingAudio(false), 2000)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* 单词信息区 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-5 py-4 border-b border-amber-200 dark:border-amber-800/50">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {wrongAnswer.word}
              </h2>
              <button
                onClick={handleAudioToggle}
                className="p-2 bg-white dark:bg-slate-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
              >
                {isPlayingAudio ? <VolumeX className="w-5 h-5 text-amber-600" /> : <Volume2 className="w-5 h-5 text-amber-600" />}
              </button>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-mono mb-1">{wrongAnswer.phonetic}</p>
            <p className="text-slate-700 dark:text-slate-300" style={{ fontFamily: 'Inter, sans-serif' }}>
              {wrongAnswer.definition}
            </p>
          </div>
        </div>
      </div>

      {/* 答题区 */}
      <div className="p-5">
        {/* 历史错误答案 */}
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
          <p className="text-sm text-red-700 dark:text-red-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="font-semibold">上次错误答案：</span>
            <span className="font-mono">{wrongAnswer.userWrongAnswer}</span>
          </p>
        </div>

        {/* 输入框 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            请拼写这个单词：
          </label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showFeedback !== null}
            placeholder="输入单词拼写..."
            className={`w-full px-4 py-3 text-lg rounded-lg border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all ${
              showFeedback
                ? showFeedback.correct
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/50'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
            onKeyDown={(e) => e.key === 'Enter' && !showFeedback && handleSubmit()}
          />
        </div>

        {/* 反馈提示 */}
        {showFeedback && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
              showFeedback.correct
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}
          >
            {showFeedback.correct ? (
              <>
                <Check className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  太棒了！已掌握
                </span>
              </>
            ) : (
              <>
                <X className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  继续加油，再试一次
                </span>
              </>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!userAnswer.trim() || showFeedback !== null}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-200 dark:shadow-none transition-all"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {showFeedback?.correct ? (
            <>
              <Check className="w-5 h-5" />
              已掌握
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5" />
              提交答案
            </>
          )}
        </button>

        {/* 复习统计 */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            <TrendingUp className="w-4 h-4" />
            <span>已复习 {wrongAnswer.reviewCount} 次</span>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif' }}>
            最初错误时间：{new Date(wrongAnswer.addedAt).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    </div>
  )
}

export function WrongAnswersReview({
  wrongAnswersQueue,
  currentWrongIndex,
  onReviewWrongAnswer,
  onBackToHome,
}: WrongAnswersReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(currentWrongIndex)

  const currentWord = wrongAnswersQueue[currentIndex]
  const progress = wrongAnswersQueue.length > 0 ? ((currentIndex + 1) / wrongAnswersQueue.length) * 100 : 0
  const completedCount = currentIndex
  const remainingCount = wrongAnswersQueue.length - currentIndex

  const handleReview = (correct: boolean) => {
    if (onReviewWrongAnswer) {
      onReviewWrongAnswer(currentWord.wordId, correct)
    }

    // 移动到下一个
    if (currentIndex < wrongAnswersQueue.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-safe">
      {/* 顶部标题区 */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              错题复习
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              专门攻克答错的单词
            </p>
          </div>
        </div>
      </div>

      {/* 进度统计 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-700 dark:to-orange-700 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-amber-100" style={{ fontFamily: 'Inter, sans-serif' }}>
              进度：{currentIndex + 1} / {wrongAnswersQueue.length}
            </span>
            <span className="text-sm text-amber-100" style={{ fontFamily: 'Inter, sans-serif' }}>
              剩余 {remainingCount} 个
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {currentWord ? (
          <>
            {/* 提示信息 */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="font-semibold">💡 学习提示：</span>
                错题复习采用间隔重复策略。答对后单词会从错题队列移除，答错则继续保持队列中待复习。
              </p>
            </div>

            {/* 当前错题卡片 */}
            <WrongAnswerCard wrongAnswer={currentWord} onReview={handleReview} />
          </>
        ) : (
          /* 完成状态 */
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
              <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              错题已全部复习完成！
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              太棒了！继续保持学习的好习惯
            </p>
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 shadow-lg transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <CheckCircle2 className="w-5 h-5" />
              返回主页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
