import Icon from './Icon'

export default function EmptyState({ title, message, icon = 'book' }: { title: string; message: string; icon?: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="rounded-full bg-brand-50 p-4 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Icon name={icon} className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{title}</h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  )
}
