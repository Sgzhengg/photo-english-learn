// =============================================================================
// PhotoEnglish - Progress Dashboard Page
// =============================================================================

import { useState, useEffect } from 'react';
import { ProgressDashboard } from '@/sections/progress-dashboard/components/ProgressDashboard';
import { practiceApi } from '@/lib/api';
import {
  adaptBackendProgressToOverview,
  generateChartData,
  adaptBackendProgressToWordStats,
  generateRecentActivities,
  generateAchievements
} from '@/lib/practice-adapter';

// Use the types from the product design
import type {
  OverviewStats,
  ChartData,
  WordStats,
  RecentActivity,
  Achievement
} from '@/../product/sections/progress-dashboard/types';

export function ProgressDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [wordStats, setWordStats] = useState<WordStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch practice progress
        const progressResult = await practiceApi.getProgress();
        if (progressResult.success && progressResult.data) {
          const backendProgress = progressResult.data;

          // Fetch review list to get more detailed stats
          const reviewResult = await practiceApi.getReviewList(100);
          const reviewRecords = reviewResult.success && reviewResult.data ? reviewResult.data : [];

          // Adapt data to frontend format
          const overview = adaptBackendProgressToOverview(backendProgress);
          const charts = generateChartData(backendProgress);
          const words = adaptBackendProgressToWordStats(backendProgress, reviewRecords);
          const activities = generateRecentActivities(backendProgress, reviewRecords);
          const achievementList = generateAchievements(backendProgress);

          setOverviewStats(overview);
          setChartData(charts);
          setWordStats(words);
          setRecentActivity(activities);
          setAchievements(achievementList);
        } else {
          console.error('Failed to fetch progress:', progressResult.error);
        }

      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-400">加载中...</div>
      </div>
    );
  }

  if (!overviewStats || !chartData || !wordStats) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-400">暂无数据</div>
      </div>
    );
  }

  return (
    <ProgressDashboard
      overviewStats={overviewStats}
      chartData={chartData}
      wordStats={wordStats}
      recentActivity={recentActivity}
      achievements={achievements}
    />
  );
}
