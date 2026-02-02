// =============================================================================
// PhotoEnglish - API Response Types
// =============================================================================

/**
 * 后端 API 返回的数据类型定义
 * 这些类型与后端 shared/database/models.py 中的响应模型匹配
 */

/**
 * 用户生词响应（匹配 UserWordResponse）
 */
export interface UserWordResponse {
  /** 生词记录ID（用于删除操作） */
  id: number;
  /** 用户ID */
  user_id: number;
  /** 单词ID */
  word_id: number;
  /** 场景ID */
  scene_id?: number;
  /** 标签ID */
  tag_id: number;
  /** 创建时间 */
  created_at: string;
  /** 单词详细信息 */
  word?: {
    word_id: number;
    english_word: string;
    chinese_meaning?: string;
    phonetic_us?: string;
    phonetic_uk?: string;
    audio_url?: string;
    example_sentence?: string;
    example_translation?: string;
    image_url?: string;
  };
  /** 标签信息 */
  tag?: {
    tag_id: number;
    tag_name: string;
    color: string;
  };
}

/**
 * API 统一响应格式
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
