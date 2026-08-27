import { useTheme } from '../hooks/useTheme'
import Icon from './Icon'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-navy-700 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
    >
      <Icon name={theme === 'light' ? 'moon' : 'sun'} className="h-4.5 w-4.5" />
    </button>
  )
}
