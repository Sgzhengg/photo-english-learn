import data from '@/../product/sections/progress-dashboard/data.json'
import { ProgressDashboard } from './components/ProgressDashboard'

export default function ProgressDashboardPreview() {
  return (
    <ProgressDashboard
      overviewStats={data.overviewStats}
      chartData={data.chartData}
      wordStats={data.wordStats}
      recentActivity={data.recentActivity.map(a => ({
        ...a,
        type: a.type as 'photo' | 'practice' | 'review'
      }))}
      achievements={data.achievements}
    />
  )
}
