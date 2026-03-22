// =============================================================================
// PhotoEnglish - Router Configuration (Anonymous Device ID Login)
// =============================================================================

import { createBrowserRouter, redirect } from 'react-router-dom';
import { AppShell } from '@/components/shell/AppShell';

// -----------------------------------------------------------------------------
// App Pages (Lazy loaded)
// -----------------------------------------------------------------------------

import { lazy } from 'react';

const PhotoCapturePage = lazy(() => import('@/components/photo-capture/PhotoCapturePage').then(m => ({ default: m.PhotoCapturePage })));
const VocabularyLibraryPage = lazy(() => import('@/components/vocabulary-library/VocabularyLibraryPage').then(m => ({ default: m.VocabularyLibraryPage })));
const SingleWordPracticePage = lazy(() => import('@/components/vocabulary-library/SingleWordPracticePage').then(m => ({ default: m.SingleWordPracticePage })));
const PracticeReviewPage = lazy(() => import('@/components/practice-review/PracticeReviewPage').then(m => ({ default: m.PracticeReviewPage })));
const ProgressDashboardPage = lazy(() => import('@/components/progress-dashboard/ProgressDashboardPage').then(m => ({ default: m.ProgressDashboardPage })));
const SettingsPage = lazy(() => import('@/components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

// -----------------------------------------------------------------------------
// Router Configuration (No authentication required)
// -----------------------------------------------------------------------------

export const router = createBrowserRouter([
  // Redirect root to main app
  {
    path: '/',
    loader: () => redirect('/app/photo-capture'),
  },

  // =============================================================================
  // Convenience redirects (for direct access)
  // =============================================================================

  {
    path: '/photo-capture',
    loader: () => redirect('/app/photo-capture'),
  },
  {
    path: '/vocabulary',
    loader: () => redirect('/app/vocabulary'),
  },
  {
    path: '/practice',
    loader: () => redirect('/app/practice'),
  },
  {
    path: '/progress',
    loader: () => redirect('/app/progress'),
  },
  {
    path: '/settings',
    loader: () => redirect('/app/settings'),
  },

  // =============================================================================
  // App Routes (with shell)
  // =============================================================================

  {
    path: '/app',
    element: <AppShell />,
    children: [
      {
        index: true,
        loader: () => redirect('/app/photo-capture'),
      },

      // Photo Capture (main feature)
      {
        path: 'photo-capture',
        element: <PhotoCapturePage />,
      },

      // Vocabulary Library
      {
        path: 'vocabulary',
        element: <VocabularyLibraryPage />,
      },
      {
        path: 'vocabulary/practice/:wordId',
        element: <SingleWordPracticePage />,
      },

      // Practice & Review
      {
        path: 'practice',
        element: <PracticeReviewPage />,
      },

      // Progress Dashboard
      {
        path: 'progress',
        element: <ProgressDashboardPage />,
      },

      // Settings
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },

  // =============================================================================
  // 404 Not Found
  // =============================================================================

  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">404</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Page not found</p>
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Go home
          </a>
        </div>
      </div>
    ),
  },
]);
