import data from '@/../product/sections/vocabulary-library/data.json'
import { VocabularyList } from './components/VocabularyList'

export default function VocabularyListPreview() {
  return (
    <VocabularyList
      words={data.words.map(w => ({
        ...w,
        learningRecord: {
          ...w.learningRecord,
          masteryLevel: w.learningRecord.masteryLevel as 'learning' | 'familiar' | 'mastered'
        }
      }))}
      tags={data.tags.map(t => ({
        ...t,
        type: t.type as 'preset' | 'custom'
      }))}
      viewMode="list"
      sortBy="addedDate"
      searchQuery=""
      selectedTags={[]}
      onViewModeChange={(mode) => console.log('View mode changed:', mode)}
      onSortChange={(option) => console.log('Sort changed:', option)}
      onSearchChange={(query) => console.log('Search query:', query)}
      onTagToggle={(tagId) => console.log('Tag toggled:', tagId)}
      onPlayPronunciation={(wordId) => console.log('Play pronunciation:', wordId)}
      onViewDetails={(wordId) => console.log('View details:', wordId)}
      onStartPractice={(wordId) => console.log('Start practice:', wordId)}
      onDeleteWord={(wordId) => console.log('Delete word:', wordId)}
    />
  )
}
