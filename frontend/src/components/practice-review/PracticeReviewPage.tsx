// =============================================================================
// PhotoEnglish - Practice & Review Page
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DailyTaskHome } from '@/sections/practice-review/components/DailyTaskHome';
import { ReviewSchedule } from '@/sections/practice-review/components/ReviewSchedule';
import { WrongAnswersReview } from '@/sections/practice-review/components/WrongAnswersReview';
import { ProgressStats as ProgressStatsView } from '@/sections/practice-review/components/ProgressStats';
import { PracticeQuestionView } from '@/sections/practice-review/components/PracticeQuestionView';
import { PracticeResultSummary } from '@/sections/practice-review/components/PracticeResultSummary';

import { practiceApi } from '@/lib/api';
import {
  adaptReviewRecordsToDailyTask,
  adaptReviewRecordToScheduleItem,
  generatePracticeQuestions,
  adaptBackendProgressToStats
} from '@/lib/practice-adapter';

// Use the types from the product design
import type {
  DailyTask,
  ProgressStats,
  PracticeQuestion,
  ReviewScheduleItem,
  WrongAnswer
} from '@/../product/sections/practice-review/types';

type PracticeView = 'home' | 'practice-questions' | 'practice-results' | 'review-schedule' | 'wrong-answers' | 'progress-stats';

// Helper function to get today's date string
const getTodayString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export function PracticeReviewPage() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<PracticeView>('home');
  const [currentWrongIndex, setCurrentWrongIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Practice questions state
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map());
  const [practiceResult, setPracticeResult] = useState<any | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Data from API
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [wrongAnswersQueue, setWrongAnswersQueue] = useState<WrongAnswer[]>([]);
  const [reviewSchedule, setReviewSchedule] = useState<ReviewScheduleItem[]>([]);

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch review list (words due for review)
        const reviewResult = await practiceApi.getReviewList(20);
        if (reviewResult.success && reviewResult.data) {
          const reviewRecords = reviewResult.data;
          const today = new Date().toISOString().split('T')[0];

          // Create daily task from review records
          const task = adaptReviewRecordsToDailyTask(reviewRecords, today);
          setDailyTask(task);

          // Create review schedule
          const schedule = reviewRecords.map(adaptReviewRecordToScheduleItem);
          setReviewSchedule(schedule);
        } else {
          console.error('Failed to fetch review list:', reviewResult.error);
          // Set empty defaults
          const today = getTodayString();
          setDailyTask({
            id: `daily-${today}`,
            date: today,
            wordsCount: 0,
            estimatedMinutes: 0,
            practiceTypes: [],
            words: [],
          });
        }

        // Fetch progress stats
        const progressResult = await practiceApi.getProgress();
        if (progressResult.success && progressResult.data) {
          const reviewRecords = reviewResult.data || [];
          const stats = adaptBackendProgressToStats(progressResult.data, reviewRecords);
          setProgressStats(stats);
        } else {
          console.error('Failed to fetch progress:', progressResult.error);
        }

      } catch (error) {
        console.error('Error fetching practice data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Event handlers
  const handleStartPractice = () => {
    if (!dailyTask || dailyTask.words.length === 0) {
      alert('暂无需要复习的单词');
      return;
    }

    // Generate practice questions from words
    const generatedQuestions = generatePracticeQuestions(dailyTask.words);
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    setPracticeResult(null);
    setCurrentView('practice-questions');
  };

  const handleSubmitAnswer = (questionId: string, answer: string) => {
    const newAnswers = new Map(userAnswers);
    newAnswers.set(questionId, answer);
    setUserAnswers(newAnswers);

    // Auto-advance to next question after submitting
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // All questions answered, show results
        handleCompletePractice();
      }
    }, 1600); // Wait for feedback to show (1.5s) + small buffer
  };

  const handleSkipQuestion = (_questionId: string) => {
    // Skip to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, show results
      handleCompletePractice();
    }
  };

  const handlePlayAudio = (_audioUrl: string) => {
    // Mock audio playback
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  };

  const handleStopAudio = () => {
    setIsPlayingAudio(false);
  };

  const handleCompletePractice = async () => {
    if (!dailyTask) return;

    // Calculate results
    const correctCount = Array.from(userAnswers.entries()).filter(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      return question && question.correctAnswer === answer;
    }).length;

    // Build wrong answers list
    const wrongAnswers = Array.from(userAnswers.entries())
      .filter(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId);
        return question && question.correctAnswer !== answer;
      })
      .map(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId);

        // 从 dailyTask 中查找对应的单词信息
        const wordInTask = dailyTask.words.find(w => w.id === question?.wordId);

        return {
          questionId,
          wordId: question?.wordId || '',
          word: wordInTask?.word || question?.correctAnswer || '',
          phonetic: wordInTask?.phonetic || question?.phonetic || '',
          definition: wordInTask?.definition || question?.hint || '',
          userWrongAnswer: answer,
          addedAt: new Date().toISOString(),
          reviewCount: 0,
        };
      });

    const result = {
      id: `practice-${Date.now()}`,
      taskId: dailyTask.id,
      completedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score: Math.round((correctCount / questions.length) * 100),
      accuracy: correctCount / questions.length,
      durationSeconds: Math.floor(Math.random() * 300) + 60,
      wrongAnswers,
    };

    setPracticeResult(result);

    // 设置错题队列，供"查看全部错题"功能使用
    setWrongAnswersQueue(wrongAnswers);

    // 提交复习结果到后端（更新艾宾浩斯曲线）
    try {
      console.log('📝 提交复习结果到后端...');
      for (const [questionId, answer] of userAnswers.entries()) {
        const question = questions.find(q => q.id === questionId);
        if (question?.wordId) {
          const isCorrect = question.correctAnswer === answer;
          // wordId 已经是字符串格式，直接使用
          const submitResult = await practiceApi.submitReview(question.wordId, isCorrect);
          if (submitResult.success) {
            console.log(`✅ 单词 ${question.wordId} 复习结果已提交，正确: ${isCorrect}`);
          } else {
            console.error(`❌ 单词 ${question.wordId} 复习结果提交失败:`, submitResult.error);
          }
        }
      }
      console.log('✅ 所有复习结果已提交');
    } catch (error) {
      console.error('❌ 提交复习结果时出错:', error);
    }

    setCurrentView('practice-results');
  };

  const handleRestartPractice = () => {
    handleStartPractice();
  };

  const handleBackToHomeFromResults = () => {
    setPracticeResult(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    setCurrentView('home');
  };

  const handleViewReviewSchedule = () => {
    setCurrentView('review-schedule');
  };

  const handleReviewWrongAnswers = () => {
    setCurrentWrongIndex(0);
    setCurrentView('wrong-answers');
  };

  const handleViewProgressStats = () => {
    // Navigate to progress dashboard page using React Router
    navigate('/app/progress');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleReviewWrongAnswer = async (_wordId: string, correct: boolean) => {
    // Move to next wrong answer
    if (correct && currentWrongIndex < wrongAnswersQueue.length - 1) {
      setCurrentWrongIndex(currentWrongIndex + 1);
    }
  };

  const setCurrentIndex = (index: number) => {
    setCurrentWrongIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {currentView === 'home' && dailyTask && progressStats && (
        <DailyTaskHome
          dailyTask={dailyTask}
          progressStats={progressStats}
          wrongAnswersCount={wrongAnswersQueue.length}
          onStartPractice={handleStartPractice}
          onViewReviewSchedule={handleViewReviewSchedule}
          onViewProgressStats={handleViewProgressStats}
          onReviewWrongAnswers={handleReviewWrongAnswers}
        />
      )}

      {currentView === 'review-schedule' && (
        <ReviewSchedule
          reviewSchedule={reviewSchedule}
          onBackToHome={handleBackToHome}
        />
      )}

      {currentView === 'wrong-answers' && (
        <WrongAnswersReview
          wrongAnswersQueue={wrongAnswersQueue}
          currentWrongIndex={currentWrongIndex}
          onReviewWrongAnswer={handleReviewWrongAnswer}
          onBackToHome={handleBackToHome}
        />
      )}

      {currentView === 'practice-questions' && questions.length > 0 && (
        <PracticeQuestionView
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          userAnswers={userAnswers}
          isPlayingAudio={isPlayingAudio}
          onSubmitAnswer={handleSubmitAnswer}
          onSkipQuestion={handleSkipQuestion}
          onPlayAudio={handlePlayAudio}
          onStopAudio={handleStopAudio}
        />
      )}

      {currentView === 'practice-results' && practiceResult && (
        <PracticeResultSummary
          practiceResult={practiceResult}
          questions={questions}
          onRestartPractice={handleRestartPractice}
          onBackToHome={handleBackToHomeFromResults}
        />
      )}

      {currentView === 'progress-stats' && progressStats && (
        <ProgressStatsView
          progressStats={progressStats}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
}
