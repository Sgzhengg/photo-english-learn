// =============================================================================
// PhotoEnglish - Single Word Practice Page
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Volume2, Check, X, SkipForward, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { vocabularyApi } from '@/lib/api';
import type { Word } from '@/../product/sections/vocabulary-library/types';

// 题目类型
type QuestionType = 'spelling' | 'meaning' | 'example';

interface Question {
  id: string;
  type: QuestionType;
  wordId: string;
  question: string;
  hint?: string;
  correctAnswer: string;
}

export function SingleWordPracticePage() {
  const { wordId } = useParams<{ wordId: string }>();
  const navigate = useNavigate();

  const [word, setWord] = useState<Word | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // 加载单词数据并生成题目
  useEffect(() => {
    const fetchWord = async () => {
      if (!wordId) {
        navigate('/app/vocabulary');
        return;
      }

      try {
        const result = await vocabularyApi.getWord(wordId);
        if (result.success && result.data) {
          setWord(result.data as any);
          generateQuestions(result.data as any);
        } else {
          console.error('Failed to fetch word:', result.error);
          navigate('/app/vocabulary');
        }
      } catch (error) {
        console.error('Error fetching word:', error);
        navigate('/app/vocabulary');
      }
    };

    fetchWord();
  }, [wordId, navigate]);

  // 根据单词生成练习题目
  const generateQuestions = (targetWord: Word) => {
    const generatedQuestions: Question[] = [];

    // 1. 拼写题 - 根据中文拼写单词
    generatedQuestions.push({
      id: `${targetWord.id}-spelling`,
      type: 'spelling',
      wordId: targetWord.id,
      question: `请拼写单词：${targetWord.definition}`,
      hint: `正确拼写：${targetWord.word}`,
      correctAnswer: targetWord.word.toLowerCase(),
    });

    // 2. 释义题 - 根据单词选择正确的中文释义（这里简化为填空）
    generatedQuestions.push({
      id: `${targetWord.id}-meaning`,
      type: 'meaning',
      wordId: targetWord.id,
      question: `"${targetWord.word}" 的中文释义是什么？`,
      correctAnswer: targetWord.definition,
    });

    // 3. 例句填空题 - 如果有例句，生成填空题
    if (targetWord.examples && targetWord.examples.length > 0) {
      const example = targetWord.examples[0];
      const sentence = example.sentence;
      // 将单词替换为空格
      const blankedSentence = sentence.replace(
        new RegExp(targetWord.word, 'gi'),
        '_____'
      );

      generatedQuestions.push({
        id: `${targetWord.id}-example`,
        type: 'example',
        wordId: targetWord.id,
        question: `请填空完成句子：\n${blankedSentence}`,
        hint: `中文翻译：${example.translation}`,
        correctAnswer: targetWord.word.toLowerCase(),
      });
    }

    setQuestions(generatedQuestions);
  };

  // 播放单词发音
  const playPronunciation = () => {
    if (!word) return;

    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    setIsPlaying(true);

    utterance.onend = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // 提交答案
  const handleSubmit = () => {
    if (!userAnswer.trim() || showFeedback) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase();

    setShowFeedback({
      correct: isCorrect,
      message: isCorrect ? '正确！🎉' : `正确答案：${currentQuestion.correctAnswer}`,
    });

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    // 自动进入下一题
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setUserAnswer('');
        setShowFeedback(null);
        setShowHint(false); // 重置提示状态
      }
    }, 2000);
  };

  // 跳过当前题目
  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setShowFeedback(null);
      setShowHint(false); // 重置提示状态
    }
  };

  // 重新开始练习
  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setShowFeedback(null);
    setShowHint(false); // 重置提示状态
    setCorrectCount(0);
  };

  // 返回生词库
  const handleBack = () => {
    navigate('/app/vocabulary');
  };

  // 题目类型标签
  const getQuestionTypeLabel = (type: QuestionType) => {
    const labels = {
      spelling: '✏️ 拼写题',
      meaning: '📝 释义题',
      example: '📖 填空题',
    };
    return labels[type];
  };

  // 加载中
  if (!word || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            加载中...
          </p>
        </div>
      </div>
    );
  }

  // 练习完成
  if (currentIndex >= questions.length) {
    const accuracy = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 p-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">返回生词库</span>
          </button>
        </div>

        {/* 结果卡片 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              accuracy >= 80 ? 'bg-lime-100 dark:bg-lime-900/30' :
              accuracy >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className="text-4xl">{accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}</span>
            </div>

            <h2
              className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              练习完成！
            </h2>

            <p className="text-slate-600 dark:text-slate-400 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              单词：<span className="font-semibold text-indigo-600 dark:text-indigo-400">{word.word}</span>
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-6">
              <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {accuracy}%
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                正确率
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm">
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {correctCount}
                </div>
                <div className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  正确
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {questions.length - correctCount}
                </div>
                <div className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  错误
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {questions.length}
                </div>
                <div className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  总题数
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="w-full space-y-3">
            <button
              onClick={handleRestart}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/20"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <RotateCcw className="w-5 h-5" />
              再练一次
            </button>
            <button
              onClick={handleBack}
              className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              返回生词库
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 练习进行中
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">返回</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-1 bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* 发音按钮区域（隐藏单词信息，避免直接看到答案） */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center">
          <button
            onClick={playPronunciation}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              isPlaying
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            disabled={isPlaying}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Volume2 className="w-5 h-5" fill={isPlaying ? 'currentColor' : 'none'} />
            <span className="font-medium">{isPlaying ? '播放中...' : '播放发音'}</span>
          </button>
        </div>
      </div>

      {/* 题目区域 */}
      <div className="flex-1 flex flex-col px-6 py-6 overflow-y-auto">
        {/* 题目类型标签 */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            {getQuestionTypeLabel(currentQuestion.type)}
          </span>
        </div>

        {/* 题目 */}
        <div className="mb-6">
          <p
            className="text-lg text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {currentQuestion.question}
          </p>

          {/* 可展开的提示 */}
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
        </div>

        {/* 答案输入框 */}
        <div className="mb-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            placeholder="输入你的答案..."
            disabled={!!showFeedback}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 disabled:opacity-50"
            style={{ fontFamily: 'Inter, sans-serif' }}
            autoFocus
          />
        </div>

        {/* 反馈信息 */}
        {showFeedback && (
          <div
            className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
              showFeedback.correct
                ? 'bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            {showFeedback.correct ? (
              <Check className="w-5 h-5 text-lime-600 dark:text-lime-400 shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            )}
            <p
              className={`text-sm ${
                showFeedback.correct
                  ? 'text-lime-800 dark:text-lime-300'
                  : 'text-red-800 dark:text-red-300'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {showFeedback.message}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-auto space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || !!showFeedback}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/20"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Check className="w-5 h-5" />
            提交答案
          </button>

          <button
            onClick={handleSkip}
            disabled={!!showFeedback}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <SkipForward className="w-4 h-4" />
            跳过此题
          </button>
        </div>
      </div>
    </div>
  );
}
