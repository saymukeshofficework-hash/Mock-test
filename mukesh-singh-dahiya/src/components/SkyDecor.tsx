/**
 * Decorative sky layer for dark/navy sections — soft drifting cloud blurs
 * plus twinkling stars. Purely visual: absolutely positioned, non-interactive,
 * and sits behind real content (render before it, keep content `relative z-10`).
 */
export default function SkyDecor({ stars = 9 }: { stars?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-16 left-[20%] h-40 w-72 animate-cloud-drift rounded-full bg-white/[0.04] blur-3xl" />
      <div className="absolute bottom-[-4rem] right-[15%] h-36 w-64 animate-cloud-drift-slow rounded-full bg-cyan-200/[0.05] blur-3xl" />
      {Array.from({ length: stars }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-twinkle rounded-full bg-gold-200"
          style={{
            top: `${(i * 37) % 85}%`,
            left: `${(i * 53) % 92}%`,
            width: i % 3 === 0 ? '3px' : '2px',
            height: i % 3 === 0 ? '3px' : '2px',
            animationDelay: `${(i * 0.4).toFixed(1)}s`,
            animationDuration: `${2.4 + (i % 4) * 0.6}s`,
          }}
        />
      ))}
    </div>
  )
}
