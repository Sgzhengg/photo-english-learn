// =============================================================================
// PhotoEnglish - API Service Layer
// =============================================================================

// Use environment variable for API URL
// Falls back to localhost:8000 for development if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Log API URL in development (for debugging)
console.log('🔗 API_BASE_URL:', API_BASE_URL);

// -----------------------------------------------------------------------------
// Anonymous User ID (for development mode)
// -----------------------------------------------------------------------------

// Get or generate anonymous user ID for SKIP_AUTH mode
function getAnonymousUserId(): string {
  let anonymousId = localStorage.getItem('anonymous_user_id');
  if (!anonymousId) {
    // Generate unique ID: timestamp + random string
    anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('anonymous_user_id', anonymousId);
    console.log('✅ Generated anonymous user ID:', anonymousId);
  }
  return anonymousId;
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  user: import('@/types').User;
}

// -----------------------------------------------------------------------------
// API Client
// -----------------------------------------------------------------------------

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Get token from localStorage
    const token = localStorage.getItem('access_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add anonymous user ID header for SKIP_AUTH mode
    if (!token) {
      headers['X-Anonymous-User-ID'] = getAnonymousUserId();
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        // Debug: Log 401 error details
        console.error('❌ [API] 401 Unauthorized for:', endpoint);
        console.error('❌ [API] Request headers:', headers);

        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          // Retry original request with new token
          const newToken = localStorage.getItem('access_token');
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
          }
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return await this.handleResponse<T>(retryResponse);
        }
        // DEV MODE: 不跳转到登录页，静默失败
        // this.clearTokens();
        // window.location.href = '/login';
        return { success: false, error: 'Authentication failed (dev mode).' };
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Debug: Log detailed error for all failed requests
      console.error(`❌ [API] ${response.status} ${response.statusText} for ${response.url}`);
      console.error('❌ [API] Response body:', JSON.stringify(json, null, 2));

      return {
        success: false,
        error: json.message || json.detail || json.error || 'Request failed',
      };
    }

    // Handle unified response format: {code, message, data}
    if ('code' in json && 'data' in json) {
      if (json.code === 0) {
        return {
          success: true,
          data: json.data as T,
          message: json.message,
        };
      } else {
        return {
          success: false,
          error: json.message || 'Request failed',
        };
      }
    }

    // Handle direct response format (for compatibility)
    return {
      success: true,
      data: json as T,
      message: json.message,
    };
  }

  private async refreshToken(): Promise<boolean> {
    const currentToken = localStorage.getItem('access_token');
    if (!currentToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (response.ok) {
        const json = await response.json();

        // Handle unified response format
        if (json.code === 0 && json.data) {
          localStorage.setItem('access_token', json.data.access_token);
          // Note: backend doesn't return refresh_token currently, using access_token for both
          localStorage.setItem('refresh_token', json.data.access_token);
          return true;
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// -----------------------------------------------------------------------------
// API Instance
// -----------------------------------------------------------------------------

export const api = new ApiClient(API_BASE_URL);

// -----------------------------------------------------------------------------
// Auth API
// ----------------------------------------------------------------------------//

export const authApi = {
  /**
   * User login
   * POST /auth/login
   */
  login: async (emailOrPhone: string, password: string, keepLoggedIn: boolean) => {
    console.log('🔐 [API] Login request:', { emailOrPhone, keepLoggedIn });

    // Backend expects 'username' field, not 'emailOrPhone'
    const result = await api.post<AuthTokens & { user: import('@/types').User }>('/auth/login', {
      username: emailOrPhone,  // Changed from emailOrPhone to username
      password,
      keepLoggedIn,
    });

    // Log detailed error information
    if (!result.success) {
      console.error('❌ [API] Login failed!');
      console.error('❌ [API] Error details:', result.error);
      console.error('❌ [API] Full response:', JSON.stringify(result, null, 2));
    } else {
      console.log('✅ [API] Login successful!');
    }

    return result;
  },

  /**
   * User registration
   * POST /auth/register
   */
  register: async (data: {
    emailOrPhone: string;
    verificationCode: string;
    password: string;
  }) => {
    // Backend expects 'username' field, not 'emailOrPhone'
    return api.post<AuthTokens & { user: import('@/types').User }>('/auth/register', {
      username: data.emailOrPhone,  // Changed from emailOrPhone to username
      verificationCode: data.verificationCode,
      password: data.password,
    });
  },

  /**
   * Send verification code (development mode: accepts any 6-digit code)
   * POST /auth/send-code
   */
  sendVerificationCode: async (emailOrPhone: string) => {
    return api.post<{ message: string }>('/auth/send-code', { emailOrPhone });
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refreshToken: async (refreshToken: string) => {
    return api.post<AuthTokens>('/auth/refresh', { refreshToken });
  },

  /**
   * Get current user info
   * GET /auth/me
   */
  getCurrentUser: async () => {
    return api.get<import('@/types').User>('/auth/me');
  },

  /**
   * Reset password
   * POST /auth/reset-password
   */
  resetPassword: async (data: {
    emailOrPhone: string;
    verificationCode: string;
    newPassword: string;
  }) => {
    return api.post<{ message: string }>('/auth/reset-password', data);
  },

  /**
   * Logout
   * POST /auth/logout
   */
  logout: async () => {
    return api.post<{ message: string }>('/auth/logout');
  },
};

// -----------------------------------------------------------------------------
// User API
// -----------------------------------------------------------------------------

export const userApi = {
  /**
   * Update user preferences (after onboarding)
   * PATCH /user/preferences
   */
  updatePreferences: async (preferences: {
    englishLevel: 'beginner' | 'intermediate' | 'advanced';
    dailyGoal: '10' | '20' | '30' | '50';
  }) => {
    return api.patch<import('@/types').User>('/user/preferences', preferences);
  },

  /**
   * Update user profile
   * PATCH /user/profile
   */
  updateProfile: async (data: {
    nickname?: string;
    avatar_url?: string;
  }) => {
    return api.patch<import('@/types').User>('/user/profile', data);
  },

  /**
   * Change password
   * POST /user/change-password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return api.post<{ message: string }>('/user/change-password', data);
  },
};

// -----------------------------------------------------------------------------
// Photo API (for later milestones)
// -----------------------------------------------------------------------------

export const photoApi = {
  /**
   * Upload photo for OCR recognition
   * POST /photo/recognize
   */
  recognize: async (formData: FormData) => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/photo/recognize`, {
      method: 'POST',
      headers,
      body: formData, // Don't set Content-Type, let browser set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Recognition failed' }));
      return { success: false, error: error.message || error.detail || 'Recognition failed' };
    }

    const json = await response.json();
    return { success: true, data: json.data };
  },

  /**
   * Get user's photos
   * GET /photos
   */
  getPhotos: () =>
    api.get<import('@/types').Photo[]>('/photos'),

  /**
   * Save words from photo to vocabulary library
   * POST /photo/:photoId/save-words
   */
  saveWords: (photoId: string, wordIds: string[]) =>
    api.post<import('@/types').Word[]>(`/photo/${photoId}/save-words`, { wordIds }),
};

// -----------------------------------------------------------------------------
// Vocabulary API (for later milestones)
// -----------------------------------------------------------------------------

export const vocabularyApi = {
  /**
   * Lookup word and get its word_id
   * GET /words/lookup/:word (routes to word-service /lookup/:word)
   * If word doesn't exist in database, it will be fetched from dictionary API
   */
  lookupWord: (word: string) =>
    api.get<any>(`/words/lookup/${encodeURIComponent(word)}`),

  /**
   * Get user's vocabulary library
   * GET /words/list (routes to word-service /list)
   * Backend returns List[UserWordResponse] directly
   */
  getWords: (_params?: {
    search?: string;
    tags?: string[];
    masteryLevel?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<import('@/types/api').UserWordResponse[]>('/words/list'),

  /**
   * Add word to vocabulary
   * POST /words/add (routes to word-service /add)
   * @param wordId - 单词 ID
   * @param sceneId - 场景 ID（可选）
   * @param wordDetails - 单词详情（可选，来自 vision-service）
   */
  addWord: (
    wordId: number,
    sceneId?: number,
    wordDetails?: {
      chinese_meaning?: string;
      phonetic_us?: string;
      phonetic_uk?: string;
      example_sentence?: string;
      example_translation?: string;
    }
  ) =>
    api.post<import('@/types').Word>('/words/add', {
      word_id: wordId,
      scene_id: sceneId,
      ...wordDetails
    }),

  /**
   * Get word details
   * GET /words/:wordId
   */
  getWord: (wordId: string) =>
    api.get<import('@/types').Word>(`/words/${wordId}`),

  /**
   * Create tag
   * POST /words/tags/list (routes to word-service /tags/list)
   * Note: This might not be implemented in backend yet
   */
  createTag: (name: string, color?: string) =>
    api.post<import('@/types').Tag>('/words/tags', { name, color }),

  /**
   * Get user's tags
   * GET /words/tags/list (routes to word-service /tags/list)
   */
  getTags: () =>
    api.get<import('@/types').Tag[]>('/words/tags/list'),

  /**
   * Update word tags
   * PATCH /words/:wordId/tag
   */
  updateWordTags: (wordId: string, tags: string[]) =>
    api.patch<import('@/types').Word>(`/words/${wordId}/tag`, { tags }),

  /**
   * Delete word
   * DELETE /words/:wordId
   */
  deleteWord: (wordId: string) =>
    api.delete<{ message: string }>(`/words/${wordId}`),
};

// -----------------------------------------------------------------------------
// Practice API
// -----------------------------------------------------------------------------

export const practiceApi = {
  /**
   * Get review list (words due for review)
   * GET /practice/review
   */
  getReviewList: async (limit: number = 20) => {
    return api.get<any[]>(`/practice/review?limit=${limit}`);
  },

  /**
   * Submit review result
   * POST /practice/review/{word_id}
   */
  submitReview: async (wordId: string, isCorrect: boolean) => {
    const formData = new FormData();
    formData.append('is_correct', String(isCorrect));

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/practice/review/${wordId}?is_correct=${isCorrect}`, {
      method: 'POST',
      headers,
    });

    const json = await response.json();
    if (json.code === 0 && json.data) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.message || 'Failed to submit review' };
  },

  /**
   * Get practice progress
   * GET /practice/progress
   */
  getProgress: () =>
    api.get<{
      pending_review_count: number;
      total_words_count: number;
      total_correct: number;
      total_wrong: number;
    }>('/practice/progress'),
};

// -----------------------------------------------------------------------------
// Progress API (for later milestones)
// -----------------------------------------------------------------------------

export const progressApi = {
  /**
   * Get user's learning progress
   * GET /progress
   */
  get: () =>
    api.get<import('@/types').Progress>('/progress'),
};

// -----------------------------------------------------------------------------
// ASR API (Automatic Speech Recognition)
// -----------------------------------------------------------------------------

export interface AsrRecognitionResult {
  text: string;
  confidence: number;
  engine: string;
  language: string;
  duration?: number;
}

export interface PronunciationScore {
  overall: number; // 总分 0-100
  accuracy: number; // 准确度 0-100
  fluency: number; // 流利度 0-100
  completeness: number; // 完整度 0-100
  feedback: string;
}

export interface AsrEvaluateResult {
  recorded_text: string;
  target_text: string;
  score: PronunciationScore;
}

export const asrApi = {
  /**
   * Recognize audio from file
   * POST /asr/recognize
   */
  recognize: async (audioFile: File, language: string = 'en-US', engine: string = 'groq-whisper') => {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('language', language);
    formData.append('engine', engine);

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/asr/recognize`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Recognition failed' }));
      return { success: false, error: error.message || error.detail || 'Recognition failed' };
    }

    const data = await response.json();
    return { success: true, data: data.data as AsrRecognitionResult };
  },

  /**
   * Recognize audio from URL
   * POST /asr/recognize-url
   */
  recognizeFromUrl: async (audioUrl: string, language: string = 'en-US', engine: string = 'groq-whisper') => {
    const formData = new FormData();
    formData.append('audio_url', audioUrl);
    formData.append('language', language);
    formData.append('engine', engine);

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/asr/recognize-url`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Recognition failed' }));
      return { success: false, error: error.message || error.detail || 'Recognition failed' };
    }

    const data = await response.json();
    return { success: true, data: data.data as AsrRecognitionResult };
  },

  /**
   * Evaluate pronunciation against target text
   * POST /asr/evaluate-pronunciation
   */
  evaluatePronunciation: async (audioFile: File, targetText: string, language: string = 'en-US') => {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('target_text', targetText);
    formData.append('language', language);

    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/asr/evaluate-pronunciation`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Evaluation failed' }));
      return { success: false, error: error.message || error.detail || 'Evaluation failed' };
    }

    const data = await response.json();
    return { success: true, data: data.data as AsrEvaluateResult };
  },

  /**
   * Get available recognition engines
   * GET /asr/engines
   */
  getEngines: async () => {
    return api.get<{ engines: Array<{ id: string; name: string; description: string; available: boolean }> }>('/asr/engines');
  },

  /**
   * Get ASR service configuration
   * GET /asr/config
   */
  getConfig: async () => {
    return api.get<{
      supported_languages: string[];
      supported_engines: string[];
      default_engine: string;
      default_language: string;
      max_audio_size: number;
      supported_formats: string[];
    }>('/asr/config');
  },
};
