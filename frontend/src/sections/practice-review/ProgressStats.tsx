import data from '@/../product/sections/practice-review/data.json'
import { ProgressStats } from './components/ProgressStats'

export default function ProgressStatsPreview() {
  return (
    <ProgressStats
      progressStats={data.progressStats}
      onBackToHome={() => console.log('Back to home')}
    />
  )
}
