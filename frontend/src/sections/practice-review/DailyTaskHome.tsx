import data from '@/../product/sections/practice-review/data.json'
import { DailyTaskHome } from './components/DailyTaskHome'
import type { ProgressStats } from '@/../product/sections/practice-review/types'

export default function DailyTaskHomePreview() {
  return (
    <DailyTaskHome
      dailyTask={{
        ...data.dailyTask,
        practiceTypes: data.dailyTask.practiceTypes as Array<'fill-blank' | 'multiple-choice' | 'dictation'>,
        words: data.dailyTask.words.map(w => ({
          ...w,
          masteryLevel: w.masteryLevel as 'learning' | 'familiar' | 'mastered'
        }))
      }}
      progressStats={data.progressStats as ProgressStats | null}
      wrongAnswersCount={data.wrongAnswersQueue.length}
      onStartPractice={() => console.log('Start practice')}
      onViewReviewSchedule={() => console.log('View review schedule')}
      onViewProgressStats={() => console.log('View progress stats')}
      onReviewWrongAnswers={() => console.log('Review wrong answers')}
    />
  )
}
