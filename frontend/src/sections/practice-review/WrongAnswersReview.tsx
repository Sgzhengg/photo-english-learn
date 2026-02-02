import data from '@/../product/sections/practice-review/data.json'
import { WrongAnswersReview } from './components/WrongAnswersReview'

export default function WrongAnswersReviewPreview() {
  return (
    <WrongAnswersReview
      wrongAnswersQueue={data.wrongAnswersQueue}
      currentWrongIndex={0}
      onReviewWrongAnswer={(wordId, correct) => console.log('Review wrong answer:', wordId, correct)}
      onBackToHome={() => console.log('Back to home')}
    />
  )
}
