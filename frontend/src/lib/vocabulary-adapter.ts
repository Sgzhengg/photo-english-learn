// =============================================================================
// PhotoEnglish - Vocabulary Data Adapter
// =============================================================================

/**
 * 适配器模块：将后端API响应转换为前端数据格式
 */

import type { UserWordResponse } from '@/types/api';
import type { Word } from '@/../product/sections/vocabulary-library/types';

/**
 * 将后端 UserWordResponse 转换为前端 Word 类型
 *
 * @param userWord 后端API返回的用户生词数据
 * @returns 前端使用的Word对象
 */
export function adaptUserWordToWord(userWord: UserWordResponse): Word {
  const baseWord = userWord.word;

  return {
    id: String(userWord.id), // 使用 UserWord.id（用于删除，保持为字符串）
    word: baseWord?.english_word || '',
    phonetic: baseWord?.phonetic_us || '',
    definition: baseWord?.chinese_meaning || '',
    partOfSpeech: 'n.',
    examples: baseWord?.example_sentence && baseWord?.example_translation
      ? [{
          sentence: baseWord.example_sentence,
          translation: baseWord.example_translation,
          fromPhoto: userWord.scene_id ? String(userWord.scene_id) : null,
        }]
      : [],
    pronunciationUrl: baseWord?.audio_url || '',
    sourcePhoto: (baseWord?.image_url
      ? {
          id: `photo-${userWord.scene_id || 'unknown'}`,
          thumbnailUrl: baseWord.image_url,
          location: '识别场景',
          capturedAt: userWord.created_at,
        }
      : undefined) as any,
    learningRecord: {
      addedDate: userWord.created_at,
      reviewCount: 0, // 后端暂未提供
      masteryLevel: 'learning',
      lastReviewDate: userWord.created_at,
    },
    tags: userWord.tag ? [userWord.tag.tag_name] : [],
  };
}

/**
 * 将后端 UserWordResponse 列表转换为前端 Word 列表
 *
 * @param userWords 后端API返回的用户生词列表
 * @returns 前端使用的Word对象数组
 */
export function adaptUserWordsToWords(userWords: UserWordResponse[]): Word[] {
  return userWords.map(adaptUserWordToWord);
}

/**
 * 从 Word 对象中提取后端需要的整数ID
 * 用于删除操作
 *
 * @param word 前端Word对象
 * @returns 后端的UserWord.id（整数）
 * @throws Error 如果ID是模拟数据格式或无法转换为整数
 */
export function extractUserWordId(word: Word): number {
  // 检查是否是模拟数据（格式如 "word-001"）
  if (word.id.startsWith('word-') || word.id.startsWith('photo-')) {
    throw new Error('demo_data');
  }

  const id = parseInt(word.id, 10);
  if (isNaN(id)) {
    throw new Error(`Invalid word ID: ${word.id}`);
  }
  return id;
}
