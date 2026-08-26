interface Props {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
}

export default function SectionHeading({ eyebrow, title, description, align = 'center', light = false }: Props) {
  const alignment = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start'
  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignment}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className={`text-3xl font-semibold sm:text-4xl ${light ? 'text-white' : 'text-navy-900'}`}>{title}</h2>
      {description && (
        <p className={`text-base leading-relaxed ${light ? 'text-white/80' : 'text-navy-800/70'}`}>{description}</p>
      )}
    </div>
  )
}
