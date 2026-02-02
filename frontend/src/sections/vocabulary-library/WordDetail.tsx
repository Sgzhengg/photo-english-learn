import data from '@/../product/sections/vocabulary-library/data.json'
import { WordDetail } from './components/WordDetail'

export default function WordDetailPreview() {
  // 使用第一个单词作为示例
  const sampleWord = data.words[0]
  const tags = data.tags as any[]

  return (
    <WordDetail
      word={{
        ...sampleWord,
        learningRecord: {
          ...sampleWord.learningRecord,
          masteryLevel: sampleWord.learningRecord.masteryLevel as 'learning' | 'familiar' | 'mastered'
        }
      }}
      tags={tags}
      onBack={() => console.log('Back to list')}
      onPlayPronunciation={(wordId) => console.log('Play pronunciation:', wordId)}
      onStartPractice={(wordId) => console.log('Start practice:', wordId)}
      onDeleteWord={(wordId) => console.log('Delete word:', wordId)}
    />
  )
}
