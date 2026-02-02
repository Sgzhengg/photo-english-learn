import data from '@/../product/sections/practice-review/data.json'
import { ReviewSchedule } from './components/ReviewSchedule'

export default function ReviewSchedulePreview() {
  return (
    <ReviewSchedule
      reviewSchedule={data.reviewSchedule}
      onBackToHome={() => console.log('Back to home')}
    />
  )
}
