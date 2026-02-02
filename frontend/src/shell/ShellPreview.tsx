import { AppShell } from './components'

export default function ShellPreview() {
  const navigationItems = [
    {
      label: '生词库',
      href: '/vocabulary',
      icon: 'book-open',
    },
    {
      label: '拍照',
      href: '/photo',
      icon: 'camera',
      isPrimary: true,
      isActive: true,
    },
    {
      label: '练习',
      href: '/practice',
      icon: 'pen-line',
    },
    {
      label: '统计',
      href: '/progress',
      icon: 'bar-chart-3',
    },
  ]

  const user = {
    name: 'Alex Morgan',
    avatarUrl: undefined,
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      onNavigate={(href) => console.log('Navigate to:', href)}
      onLogout={() => console.log('Logout')}
      onSettings={() => console.log('Settings')}
    >
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            拍照识别
          </h2>
          <p className="text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            章节内容将在此处渲染
          </p>
        </div>
      </div>
    </AppShell>
  )
}
