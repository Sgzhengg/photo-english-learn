// =============================================================================
// PhotoEnglish - Practice Configuration Component
// =============================================================================

import { X, Check } from 'lucide-react';

export interface PracticeConfig {
  practiceTypes: string[];
  questionCount: number;
  masteryLevels: string[];
}

interface PracticeConfigModalProps {
  isOpen: boolean;
  config: PracticeConfig;
  onConfigChange: (config: PracticeConfig) => void;
  onStartPractice: () => void;
  onClose: () => void;
}

const practiceTypeOptions = [
  { id: 'fill-blank', label: '填空题', description: '根据语境填入正确的单词' },
  { id: 'translation', label: '翻译题', description: '翻译英文单词或句子' },
  { id: 'scene-sentence', label: '场景句子', description: '结合图片场景练习' },
];

const questionCountOptions = [
  { id: 10, label: '10 题', description: '快速练习，约 3 分钟' },
  { id: 20, label: '20 题', description: '标准练习，约 6 分钟' },
  { id: 30, label: '30 题', description: '强化练习，约 10 分钟' },
  { id: 50, label: '50 题', description: '极限挑战，约 15 分钟' },
];

const masteryLevelOptions = [
  { id: 'learning', label: '学习中', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { id: 'familiar', label: '熟悉', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { id: 'mastered', label: '已掌握', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
];

export function PracticeConfigModal({
  isOpen,
  config,
  onConfigChange,
  onStartPractice,
  onClose,
}: PracticeConfigModalProps) {
  if (!isOpen) return null;

  const togglePracticeType = (typeId: string) => {
    const newTypes = config.practiceTypes.includes(typeId)
      ? config.practiceTypes.filter(t => t !== typeId)
      : [...config.practiceTypes, typeId];

    onConfigChange({ ...config, practiceTypes: newTypes });
  };

  const toggleMasteryLevel = (levelId: string) => {
    const newLevels = config.masteryLevels.includes(levelId)
      ? config.masteryLevels.filter(l => l !== levelId)
      : [...config.masteryLevels, levelId];

    onConfigChange({ ...config, masteryLevels: newLevels });
  };

  const canStart = config.practiceTypes.length > 0 && config.masteryLevels.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            练习配置
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Practice Types */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              练习类型
            </h3>
            <div className="space-y-2">
              {practiceTypeOptions.map((type) => {
                const isSelected = config.practiceTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    onClick={() => togglePracticeType(type.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {type.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {type.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Question Count */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              题目数量
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {questionCountOptions.map((option) => {
                const isSelected = config.questionCount === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => onConfigChange({ ...config, questionCount: option.id as number })}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {option.label}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Mastery Levels */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              单词掌握程度
            </h3>
            <div className="flex flex-wrap gap-2">
              {masteryLevelOptions.map((level) => {
                const isSelected = config.masteryLevels.includes(level.id);
                return (
                  <button
                    key={level.id}
                    onClick={() => toggleMasteryLevel(level.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? level.color + ' ring-2 ring-offset-2 ring-current'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {level.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            取消
          </button>
          <button
            onClick={onStartPractice}
            disabled={!canStart}
            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            开始练习
          </button>
        </div>
      </div>
    </div>
  );
}
