import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import type { OnboardingPageProps, OnboardingStep, EnglishLevel, DailyGoal } from './types'

// 引导页数据
const onboardingSteps = [
  {
    step: 0 as OnboardingStep,
    title: '欢迎使用 PhotoEnglish',
    description: '通过拍照识别技术，轻松积累英语词汇',
    icon: '📸',
  },
  {
    step: 1 as OnboardingStep,
    title: '拍照识别生词',
    description: '遇到不认识的单词，拍一下即可保存到生词库，AI 自动识别并提供释义',
    icon: '🔍',
  },
  {
    step: 2 as OnboardingStep,
    title: '语境化练习',
    description: 'AI 生成包含生词的真实场景句子，通过填空和翻译练习，真正会用单词',
    icon: '✍️',
  },
  {
    step: 3 as OnboardingStep,
    title: '设置学习目标',
    description: '告诉我们您的英语水平和每日学习目标，为您定制个性化学习计划',
    icon: '🎯',
  },
]

const englishLevels: { value: EnglishLevel; label: string; description: string }[] = [
  { value: 'beginner', label: '初级', description: '刚刚开始学习英语' },
  { value: 'intermediate', label: '中级', description: '有一定基础，想提升应用能力' },
  { value: 'advanced', label: '高级', description: '英语水平较好，追求精通' },
]

const dailyGoals: { value: DailyGoal; label: string; description: string }[] = [
  { value: '10', label: '每天 10 个单词', description: '轻松学习，养成习惯' },
  { value: '20', label: '每天 20 个单词', description: '稳步提升，推荐选择' },
  { value: '30', label: '每天 30 个单词', description: '进阶学习，快速积累' },
  { value: '50', label: '每天 50 个单词', description: '挑战自我，高强度学习' },
]

export function OnboardingPage({
  currentStep,
  preferences,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  onUpdatePreferences,
}: OnboardingPageProps) {
  const currentData = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      onComplete(preferences)
    } else {
      onNext()
    }
  }

  const handleSelectEnglishLevel = (level: EnglishLevel) => {
    onUpdatePreferences({ ...preferences, englishLevel: level })
  }

  const handleSelectDailyGoal = (goal: DailyGoal) => {
    onUpdatePreferences({ ...preferences, dailyGoal: goal })
  }

  const isPreferencesValid = preferences.englishLevel && preferences.dailyGoal

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* 跳过按钮 */}
      {!isLastStep && (
        <div className="flex justify-end p-4">
          <button
            onClick={onSkip}
            className="px-5 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-colors rounded-full hover:bg-white/50 dark:hover:bg-slate-800/50"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            跳过
          </button>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* 图标 */}
        <div className="w-28 h-28 mb-8 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center">
          <span className="text-6xl">{currentData.icon}</span>
        </div>

        {/* 标题和描述 */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {currentData.title}
        </h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 text-center max-w-md leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          {currentData.description}
        </p>

        {/* 第4步：偏好设置 */}
        {currentStep === 3 && (
          <div className="w-full max-w-md mt-8 space-y-6">
            {/* 英语水平选择 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                您的英语水平
              </h3>
              <div className="space-y-2">
                {englishLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleSelectEnglishLevel(level.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      preferences.englishLevel === level.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {level.label}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {level.description}
                        </div>
                      </div>
                      {preferences.englishLevel === level.value && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 每日学习目标选择 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                每日学习目标
              </h3>
              <div className="space-y-2">
                {dailyGoals.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => handleSelectDailyGoal(goal.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      preferences.dailyGoal === goal.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {goal.label}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {goal.description}
                        </div>
                      </div>
                      {preferences.dailyGoal === goal.value && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <div className="px-6 py-8">
        {/* 分页指示器 */}
        <div className="flex justify-center gap-2 mb-6">
          {onboardingSteps.map((step) => (
            <div
              key={step.step}
              className={`h-2 rounded-full transition-all ${
                step.step === currentStep
                  ? 'w-8 bg-indigo-500'
                  : 'w-2 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* 导航按钮 */}
        <div className="flex gap-3 max-w-md mx-auto">
          {/* 上一步按钮 */}
          {!isFirstStep && (
            <button
              onClick={onPrevious}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </button>
          )}

          {/* 下一步/完成按钮 */}
          <button
            onClick={handleNext}
            disabled={currentStep === 3 && !isPreferencesValid}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {isLastStep ? (
              <>
                开始使用
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                下一步
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
