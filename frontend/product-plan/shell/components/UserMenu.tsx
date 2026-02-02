import { User, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'

interface UserMenuProps {
  user: {
    name: string
    avatarUrl?: string
  }
  onLogout?: () => void
  onSettings?: () => void
}

export function UserMenu({ user, onLogout, onSettings }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <User className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 p-3 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {user.name}
              </p>
            </div>

            <div className="p-1">
              <button
                onClick={() => {
                  onSettings?.()
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <Settings className="h-4 w-4" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>设置</span>
              </button>

              <button
                onClick={() => {
                  onLogout?.()
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-4 w-4" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>登出</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
