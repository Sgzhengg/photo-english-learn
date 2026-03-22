// =============================================================================
// PhotoEnglish - Photo Capture Page
// =============================================================================

import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { PhotoCaptureResult } from '@/sections/photo-capture/components/PhotoCaptureResult';
import type { Photo } from '@/sections/photo-capture/types';
import { photoApi, vocabularyApi } from '@/lib/api';

export function PhotoCapturePage() {
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [savingWordId, setSavingWordId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    const imageUrl = URL.createObjectURL(file);

    try {
      // Call backend OCR API
      const formData = new FormData();
      formData.append('file', file);

      const response = await photoApi.recognize(formData);

      if (response.success && response.data) {
        // Convert backend response to Photo format
        const recognizedPhoto: Photo = {
          id: response.data.photo.id,
          userId: response.data.photo.userId,
          imageUrl: imageUrl, // Use local blob URL for display
          thumbnailUrl: imageUrl,
          capturedAt: response.data.photo.capturedAt,
          location: '识别成功',
          status: 'completed',
          recognizedWords: response.data.words.map((word: any, index: number) => ({
            id: word.id,
            word: word.word,
            phonetic: word.phonetic || '',
            definition: word.definition || '',
            pronunciationUrl: word.pronunciationUrl || '',
            isSaved: word.isSaved || false,
            positionInSentence: index,
          })),
          sceneDescription: response.data.sceneDescription || '',
          sceneTranslation: response.data.sceneTranslation || '',
        };

        setCurrentPhoto(recognizedPhoto);
      } else {
        // Handle error
        console.error('OCR recognition failed:', response.error);
        alert('图片识别失败: ' + (response.error || '未知错误'));
        setCurrentPhoto(null);
      }
    } catch (error) {
      console.error('OCR recognition error:', error);
      alert('图片识别出错: ' + (error instanceof Error ? error.message : '未知错误'));
      setCurrentPhoto(null);
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle word pronunciation (Web Speech API)
  const handlePlayWordPronunciation = (wordId: string) => {
    const word = currentPhoto?.recognizedWords.find(w => w.id === wordId);
    if (!word) return;

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    // Use Web Speech API
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;  // Normal speed
    window.speechSynthesis.speak(utterance);
  };

  // Handle save word (优化版：使用快速API，跳过lookup步骤)
  const handleSaveWord = async (wordId: string) => {
    if (!currentPhoto) return;

    const word = currentPhoto.recognizedWords.find(w => w.id === wordId);
    if (!word) return;

    setSavingWordId(wordId);

    try {
      console.log('💾 [快速保存] 开始保存单词:', word.word);

      // 使用新的快速保存API，直接使用vision数据，无需lookup
      const saveResult = await vocabularyApi.saveWordWithVisionData({
        word: word.word,
        chinese_meaning: word.definition,
        phonetic: word.phonetic,
      });

      console.log('📥 保存结果:', saveResult);

      if (saveResult.success && saveResult.data) {
        // Update local state
        setCurrentPhoto({
          ...currentPhoto,
          recognizedWords: currentPhoto.recognizedWords.map(w =>
            w.id === wordId ? { ...w, isSaved: true } : w
          ),
        });
        console.log('✅ 单词保存成功！');
      } else {
        console.error('❌ 保存失败:', saveResult.error);
        alert(`保存失败: ${saveResult.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('保存单词错误:', error);
      alert(`保存失败: ${error instanceof Error ? error.message : '网络错误'}`);
    } finally {
      setSavingWordId(null);
    }
  };

  // Handle unsave word
  const handleUnsaveWord = async (wordId: string) => {
    if (!currentPhoto) return;

    // Note: For MVP, we just update local state
    // In production, you would need to call the delete API with the user_word ID
    setCurrentPhoto({
      ...currentPhoto,
      recognizedWords: currentPhoto.recognizedWords.map(word =>
        word.id === wordId ? { ...word, isSaved: false } : word
      ),
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Content */}
      {!currentPhoto ? (
        // Empty state - camera interface
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            {/* Camera icon with pulse animation */}
            <div className="mb-6 relative inline-flex">
              <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-20 animate-ping"></div>
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-8 shadow-2xl">
                <Camera className="w-16 h-16 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              拍照识别单词
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xs mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              拍摄包含英文的图片，AI 将自动识别单词并显示释义
            </p>

            {/* Capture button */}
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg disabled:cursor-not-allowed transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isCapturing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  识别中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  选择图片
                </span>
              )}
            </button>

            {/* Tips */}
            <div className="mt-12 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                💡 小贴士
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-400 text-left space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                <li>• 拍摄包含英文单词的图片</li>
                <li>• 确保文字清晰可见</li>
                <li>• 避免模糊或反光</li>
                <li>• 一次可识别多个单词</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        // Show recognition result
        <PhotoCaptureResult
          currentPhoto={currentPhoto}
          isCapturing={isCapturing}
          currentWordIndex={0}
          isPlaying={false}
          savingWordId={savingWordId}
          onCapture={handleCapture}
          onPlayWordPronunciation={handlePlayWordPronunciation}
          onSaveWord={handleSaveWord}
          onUnsaveWord={handleUnsaveWord}
        />
      )}
    </div>
  );
}
