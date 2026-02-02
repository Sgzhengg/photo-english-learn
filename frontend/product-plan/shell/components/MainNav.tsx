import { Camera, BookOpen, PenLine, BarChart3 } from 'lucide-react'

interface MainNavProps {
  items: Array<{
    label: string
    href: string
    isActive?: boolean
    icon?: string
    isPrimary?: boolean
  }>
  onNavigate?: (href: string) => void
}

const iconMap = {
  camera: Camera,
  'book-open': BookOpen,
  'pen-line': PenLine,
  'bar-chart-3': BarChart3,
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-20 items-center justify-around pb-safe">
        {items.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] || Camera
          const isPrimary = item.isPrimary

          return (
            <button
              key={item.href}
              onClick={() => onNavigate?.(item.href)}
              className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors duration-200 h-full ${
                item.isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <div className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                isPrimary
                  ? 'bg-indigo-600 p-2.5 text-white shadow-lg dark:bg-indigo-500'
                  : 'p-0'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
