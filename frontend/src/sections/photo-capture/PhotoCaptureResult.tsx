import data from '@/../product/sections/photo-capture/data.json'
import { PhotoCaptureResult } from './components/PhotoCaptureResult'

export default function PhotoCaptureResultPreview() {
  // 使用第一条已完成识别的照片记录作为示例
  const samplePhoto = {
    ...(data.photos.find(p => p.status === 'completed') || data.photos[0]),
    userId: 'preview-user-001' as const,
    status: 'completed' as const,
  }

  return (
    <PhotoCaptureResult
      currentPhoto={samplePhoto}
      isCapturing={false}
      currentWordIndex={-1}
      isPlaying={false}
      onCapture={() => console.log('Capture photo')}
      onPlayWordPronunciation={(wordId) => console.log('Play pronunciation:', wordId)}
      onSaveWord={(wordId) => console.log('Save word:', wordId)}
      onUnsaveWord={(wordId) => console.log('Unsave word:', wordId)}
    />
  )
}
