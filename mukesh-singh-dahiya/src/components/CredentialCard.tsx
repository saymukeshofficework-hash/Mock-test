import Icon from './Icon'

export default function CredentialCard({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="card flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5">
      <div className="shrink-0 rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/10 dark:text-cyan-300">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-navy-900 dark:text-slate-100">{label}</p>
    </div>
  )
}
