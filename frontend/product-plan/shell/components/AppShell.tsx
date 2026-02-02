import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

interface AppShellProps {
  children: React.ReactNode
  navigationItems: Array<{
    label: string
    href: string
    isActive?: boolean
    icon?: string
    isPrimary?: boolean
  }>
  user?: {
    name: string
    avatarUrl?: string
  }
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onSettings?: () => void
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
  onSettings,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans dark:bg-slate-900">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex h-full items-center justify-between px-4">
          <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            PhotoEnglish
          </h1>
          {user && (
            <UserMenu
              user={user}
              onLogout={onLogout}
              onSettings={onSettings}
            />
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 pt-14">
        {children}
      </main>

      {/* Bottom Navigation */}
      <MainNav items={navigationItems} onNavigate={onNavigate} />
    </div>
  )
}
