// =============================================================================
// PhotoEnglish - Practice & Progress Data Adapter
// =============================================================================

/**
 * 适配器模块：将后端API响应转换为前端数据格式
 */

import type {
  DailyTask,
  WordInTask,
  PracticeQuestion,
  ProgressStats,
  WrongAnswer,
  ReviewScheduleItem
} from '@/../product/sections/practice-review/types';

import type {
  OverviewStats,
  ChartData,
  WordStats,
  RecentActivity,
  Achievement
} from '@/../product/sections/progress-dashboard/types';

/**
 * 后端 API 响应类型
 */
interface BackendReviewRecord {
  record_id: number;
  user_id: number;
  word_id: number;
  level: number;
  next_review_time: string;
  total_correct: number;
  total_wrong: number;
  word?: {
    word_id: number;
    english_word: string;
    chinese_meaning?: string;
    phonetic_us?: string;
    example_sentence?: string;
    example_translation?: string;
  };
}

interface BackendProgress {
  pending_review_count: number;
  total_words_count: number;
  total_correct: number;
  total_wrong: number;
}

// =============================================================================
// Practice Review Adapters
// =============================================================================

/**
 * 将后端复习记录转换为前端 WordInTask 格式
 */
export function adaptReviewRecordToWordInTask(record: BackendReviewRecord): WordInTask {
  return {
    id: String(record.word_id),
    word: record.word?.english_word || '',
    phonetic: record.word?.phonetic_us || '',
    definition: record.word?.chinese_meaning || '',
    masteryLevel: record.level >= 3 ? 'mastered' : record.level >= 2 ? 'familiar' : 'learning',
    reviewCount: record.total_correct + record.total_wrong,
    nextReviewDate: record.next_review_time,
    examples: record.word?.example_sentence
      ? [{
          sentence: record.word.example_sentence,
          translation: record.word.example_translation || '',
          sourcePhoto: '',
        }]
      : [],
  };
}

/**
 * 将后端复习记录列表转换为前端 DailyTask 格式
 */
export function adaptReviewRecordsToDailyTask(
  records: BackendReviewRecord[],
  date: string = new Date().toISOString().split('T')[0]
): DailyTask {
  const words = records.map(adaptReviewRecordToWordInTask);

  return {
    id: `daily-${date}`,
    date,
    wordsCount: words.length,
    estimatedMinutes: Math.max(5, Math.ceil(words.length * 1.5)),
    practiceTypes: words.length > 0 ? ['fill-blank', 'multiple-choice'] : [],
    words,
  };
}

/**
 * 根据单词生成练习题
 * 参考百词斩、墨墨背单词、Duolingo 等优秀软件的设计
 * 每个单词生成3种题型
 */
export function generatePracticeQuestions(words: WordInTask[]): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  let questionIndex = 0;

  // 用于生成干扰选项的其他单词
  const allWords = words.map(w => w.word);
  const allDefinitions = words.map(w => w.definition);

  // 从数组中随机选择n个不重复的元素
  const getRandomItems = <T>(arr: T[], count: number, excludeItem?: T): T[] => {
    const filtered = excludeItem !== undefined ? arr.filter(item => item !== excludeItem) : arr;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  words.forEach((word) => {
    // ============================================
    // 题型1：看中文拼写英文（拼写题）
    // ============================================
    questions.push({
      id: `q-${questionIndex++}`,
      type: 'spelling',
      question: `"${word.definition}" 的英文单词是？`,
      wordId: word.id,
      correctAnswer: word.word.toLowerCase(),
      hint: `正确答案：${word.word}`,  // 显示完整单词作为提示
      options: [],
    });

    // ============================================
    // 题型2：单词填空（挖空题）
    // ============================================
    // 随机挖空1-2个字母
    const blankCount = Math.min(2, Math.floor(word.word.length / 3));
    let maskedWord = word.word;
    const blankIndices: number[] = [];
    const blankPositions: number[] = [];  // 记录挖空的位置

    while (blankIndices.length < blankCount) {
      const idx = Math.floor(Math.random() * (word.word.length - 2)) + 1; // 不挖首尾字母
      if (!blankIndices.includes(idx)) {
        blankIndices.push(idx);
        blankPositions.push(idx);
      }
    }

    // 构建挖空后的单词和正确答案
    blankPositions.forEach(idx => {
      maskedWord = maskedWord.substring(0, idx) + '_' + maskedWord.substring(idx + 1);
    });

    questions.push({
      id: `q-${questionIndex++}`,
      type: 'fill-blank',
      question: `请补全单词：${maskedWord}`,
      wordId: word.id,
      correctAnswer: word.word,  // 正确答案是完整单词
      hint: `提示：${word.definition}`,
      options: [],
    });

    // ============================================
    // 题型3：听写题（播放音频，拼写单词）
    // ============================================
    questions.push({
      id: `q-${questionIndex++}`,
      type: 'dictation',
      question: `听音拼写出单词`,
      wordId: word.id,
      correctAnswer: word.word.toLowerCase(),
      hint: `提示：${word.definition}`,
      options: [],
      audioUrl: '',  // 使用 Web Speech API，不需要实际音频 URL
      phonetic: word.phonetic,
    });
  });

  // 打乱所有题目顺序，避免题型连续出现
  return questions.sort(() => Math.random() - 0.5);
}

/**
 * 将后端复习记录转换为前端复习计划项
 */
export function adaptReviewRecordToScheduleItem(record: BackendReviewRecord): ReviewScheduleItem {
  return {
    wordId: String(record.word_id),
    word: record.word?.english_word || '',
    nextReviewDate: record.next_review_time,
    intervalDays: Math.floor(record.level * 1.5),
    easeFactor: 2.5 + record.level * 0.1,
    reviewCount: record.total_correct + record.total_wrong,
  };
}

/**
 * 将后端进度数据转换为前端 ProgressStats 格式
 */
export function adaptBackendProgressToStats(
  backendProgress: BackendProgress,
  reviewRecords: BackendReviewRecord[]
): ProgressStats {
  const totalReviews = backendProgress.total_correct + backendProgress.total_wrong;
  const averageAccuracy = totalReviews > 0
    ? backendProgress.total_correct / totalReviews
    : 0;

  // 计算各级别单词数量
  const masteredWords = reviewRecords.filter(r => r.level >= 3).length;
  const familiarWords = reviewRecords.filter(r => r.level >= 2 && r.level < 3).length;
  const learningWords = reviewRecords.filter(r => r.level < 2).length;

  return {
    totalWords: backendProgress.total_words_count,
    masteredWords,
    familiarWords,
    learningWords,
    totalPracticeSessions: totalReviews,
    totalReviews,
    averageAccuracy,
    studyDays: 1, // 后端暂未提供，默认1天
    currentStreak: 1,
    longestStreak: 1,
    lastPracticeDate: new Date().toISOString(),
    weeklyAccuracy: [
      { date: new Date().toISOString().split('T')[0], accuracy: averageAccuracy },
    ],
  };
}

// =============================================================================
// Progress Dashboard Adapters
// =============================================================================

/**
 * 将后端进度数据转换为前端 OverviewStats 格式
 */
export function adaptBackendProgressToOverview(
  backendProgress: BackendProgress
): OverviewStats {
  const today = new Date().toISOString().split('T')[0];

  return {
    today: {
      date: today,
      wordsLearned: backendProgress.pending_review_count,
      practiceSessions: 0,
      reviewsCompleted: backendProgress.total_wrong,
      accuracy: backendProgress.total_words_count > 0
        ? backendProgress.total_correct / (backendProgress.total_correct + backendProgress.total_wrong)
        : 0,
      studyMinutes: 0,
    },
    thisWeek: {
      studyDays: 1,
      wordsLearned: backendProgress.pending_review_count,
      practiceSessions: 0,
      reviewsCompleted: backendProgress.total_wrong,
      averageAccuracy: backendProgress.total_words_count > 0
        ? backendProgress.total_correct / (backendProgress.total_correct + backendProgress.total_wrong)
        : 0,
      totalStudyMinutes: 0,
    },
    thisMonth: {
      month: new Date().toISOString().slice(0, 7),
      studyDays: 1,
      wordsLearned: backendProgress.pending_review_count,
      practiceSessions: 0,
      reviewsCompleted: backendProgress.total_wrong,
      averageAccuracy: backendProgress.total_words_count > 0
        ? backendProgress.total_correct / (backendProgress.total_correct + backendProgress.total_wrong)
        : 0,
      totalStudyMinutes: 0,
    },
  };
}

/**
 * 生成图表数据（基于后端进度数据）
 */
export function generateChartData(backendProgress: BackendProgress): ChartData {
  const today = new Date();
  const activityTrend = [];
  const accuracyTrend = [];
  const vocabularyGrowth = [];

  // 生成30天的模拟趋势数据
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    activityTrend.push({
      date: dateStr,
      studyDays: i === 0 ? 1 : 0,
      practiceSessions: 0,
      reviewsCompleted: i === 0 ? backendProgress.total_wrong : 0,
    });

    accuracyTrend.push({
      date: dateStr,
      accuracy: backendProgress.total_words_count > 0
        ? backendProgress.total_correct / (backendProgress.total_correct + backendProgress.total_wrong)
        : 0,
    });

    vocabularyGrowth.push({
      date: dateStr,
      totalWords: backendProgress.total_words_count,
    });
  }

  return {
    activityTrend,
    accuracyTrend,
    vocabularyGrowth,
  };
}

/**
 * 将后端进度数据转换为前端 WordStats 格式
 */
export function adaptBackendProgressToWordStats(
  backendProgress: BackendProgress,
  reviewRecords: BackendReviewRecord[]
): WordStats {
  const masteredWords = reviewRecords.filter(r => r.level >= 3).length;
  const familiarWords = reviewRecords.filter(r => r.level >= 2 && r.level < 3).length;
  const learningWords = reviewRecords.filter(r => r.level < 2).length;

  return {
    totalWords: backendProgress.total_words_count,
    byMasteryLevel: {
      mastered: masteredWords,
      familiar: familiarWords,
      learning: learningWords,
    },
    topTags: [], // 后端暂未提供标签统计
  };
}

/**
 * 生成最近活动列表
 */
export function generateRecentActivities(
  backendProgress: BackendProgress,
  reviewRecords: BackendReviewRecord[]
): RecentActivity[] {
  const activities: RecentActivity[] = [];

  // 添加复习记录
  reviewRecords.slice(0, 5).forEach((record, index) => {
    activities.push({
      id: `activity-review-${index}`,
      type: 'review',
      timestamp: new Date().toISOString(),
      description: `复习了单词 "${record.word?.english_word || 'Unknown'}"`,
      details: {
        reviewCount: 1,
        accuracy: record.total_correct + record.total_wrong > 0
          ? record.total_correct / (record.total_correct + record.total_wrong)
          : 0,
      },
    });
  });

  return activities;
}

/**
 * 生成成就列表
 */
export function generateAchievements(
  backendProgress: BackendProgress
): Achievement[] {
  const totalWords = backendProgress.total_words_count;
  const totalReviews = backendProgress.total_correct + backendProgress.total_wrong;

  return [
    {
      id: 'first-word',
      name: '初学者',
      description: '添加第一个生词',
      icon: '📝',
      unlockedAt: totalWords > 0 ? new Date().toISOString() : null,
      progress: Math.min(totalWords, 1),
      target: 1,
    },
    {
      id: 'ten-words',
      name: '词汇积累',
      description: '学习10个生词',
      icon: '📚',
      unlockedAt: totalWords >= 10 ? new Date().toISOString() : null,
      progress: Math.min(totalWords, 10),
      target: 10,
    },
    {
      id: 'first-review',
      name: '开始复习',
      description: '完成第一次复习',
      icon: '🔄',
      unlockedAt: totalReviews > 0 ? new Date().toISOString() : null,
      progress: Math.min(totalReviews, 1),
      target: 1,
    },
    {
      id: 'ten-reviews',
      name: '复习达人',
      description: '完成10次复习',
      icon: '🏆',
      unlockedAt: totalReviews >= 10 ? new Date().toISOString() : null,
      progress: Math.min(totalReviews, 10),
      target: 10,
    },
  ];
}
