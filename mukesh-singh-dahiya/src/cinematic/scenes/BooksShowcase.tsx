import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { books, bookCategories, getFeaturedBooks } from '../../data/books'

gsap.registerPlugin(ScrollTrigger)

// Featured (NEET) books first, then the rest in their catalogue order —
// used by the "Buy Now" showcase below the cover strip.
const featured = getFeaturedBooks()
const rest = books.filter((b) => !b.featured)
const buyOrder = [...featured, ...rest]

export default function BooksShowcase({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.book-cover-card',
        { opacity: 0, y: reduced ? 0 : 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, scrollTrigger: { trigger: '.book-cover-strip', start: 'top 85%' } }
      )
      gsap.fromTo(
        '.book-buy-card',
        { opacity: 0, y: reduced ? 0 : 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, scrollTrigger: { trigger: '.book-buy-grid', start: 'top 80%' } }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={rootRef} id="books" className="scene-teacher relative px-6 py-28">
      {/* All published books — cover showcase */}
      <div className="mx-auto max-w-6xl">
        <p className="c-eyebrow mb-4 text-center">Published Author</p>
        <h2 className="c-huge c-serif mb-3 text-center text-4xl sm:text-5xl">{books.length} Books, Published on Amazon</h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-[color:var(--c-ink-dim)]">
          From NEET Biology question banks to English literature guides and parenting playbooks — every book Mukesh Dahiya has published.
        </p>

        <div className="book-cover-strip no-scrollbar -mx-6 flex gap-4 overflow-x-auto px-6 pb-4">
          {books.map((b) => (
            <a
              key={b.id}
              href={b.buyLink}
              target="_blank"
              rel="noopener noreferrer nofollow"
              data-cursor="hover"
              className="book-cover-card group flex w-[118px] flex-none flex-col gap-2 sm:w-[140px]"
              title={b.title}
            >
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#0c0e13] shadow-lg">
                <img
                  src={b.coverUrl}
                  alt={b.shortTitle}
                  loading="lazy"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {b.featured && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-[color:var(--c-accent)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#08090b]">
                    NEET
                  </span>
                )}
              </div>
              <span className="line-clamp-2 text-xs leading-snug text-[color:var(--c-ink-dim)] group-hover:text-[color:var(--c-ink)]">
                {b.shortTitle}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Buy Now showcase — NEET titles featured first */}
      <div className="mx-auto mt-24 max-w-6xl">
        <p className="c-eyebrow mb-4 text-center">Recommended for NEET Aspirants</p>
        <h2 className="c-huge c-serif mb-12 text-center text-3xl sm:text-4xl">Get the Books</h2>

        <div className="book-buy-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {buyOrder.map((b) => (
            <div
              key={b.id}
              className="book-buy-card relative flex gap-4 rounded-xl border border-white/10 p-4 transition-colors duration-300 hover:border-[color:var(--c-accent)]"
            >
              <img
                src={b.coverUrl}
                alt={b.shortTitle}
                loading="lazy"
                className="h-32 w-[86px] flex-none rounded-md object-cover shadow-md"
              />
              <div className="flex flex-1 flex-col">
                {b.featured && (
                  <span className="mb-1.5 inline-block w-fit rounded-full bg-[color:var(--c-accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[color:var(--c-accent)]">
                    NEET Pick
                  </span>
                )}
                <span className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--c-ink-faint)]">{b.category}</span>
                <h3 className="c-serif text-sm font-bold leading-snug">{b.shortTitle}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-[color:var(--c-ink-dim)]">{b.description}</p>
                <a
                  href={b.buyLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  data-cursor="cta"
                  data-cursor-label="Buy"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--c-accent)]"
                >
                  Buy on Amazon <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-md text-center text-[10px] uppercase tracking-wide text-[color:var(--c-ink-faint)]">
          {bookCategories.join(' · ')}
        </p>
      </div>
    </div>
  )
}
