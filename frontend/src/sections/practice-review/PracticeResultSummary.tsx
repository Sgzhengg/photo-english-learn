import data from '@/../product/sections/practice-review/data.json'
import { PracticeResultSummary } from './components/PracticeResultSummary'

export default function PracticeResultSummaryPreview() {
  return (
    <PracticeResultSummary
      practiceResult={data.practiceResult}
      questions={data.practiceQuestions.map(q => ({
        ...q,
        type: q.type as 'fill-blank' | 'multiple-choice' | 'dictation'
      }))}
      onRestartPractice={() => console.log('Restart practice')}
      onReviewWrongAnswers={() => console.log('Review wrong answers')}
      onViewProgressStats={() => console.log('View progress stats')}
      onBackToHome={() => console.log('Back to home')}
    />
  )
}
