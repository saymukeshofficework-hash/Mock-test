interface Props {
  eyebrow?: string
  title: string
  description?: string
}

export default function PageHero({ eyebrow, title, description }: Props) {
  return (
    <section className="relative overflow-hidden bg-cosmic-gradient py-16 sm:py-20">
      <div className="star-field pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-page relative flex flex-col items-center gap-3 text-center">
        {eyebrow && <span className="eyebrow text-champagne-300">{eyebrow}</span>}
        <h1 className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-white/80">{description}</p>}
      </div>
    </section>
  )
}
