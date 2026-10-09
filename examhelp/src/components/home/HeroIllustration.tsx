/** Lightweight inline SVG hero art: exam sheet, calendar and progress target. */
export function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 340" className="h-auto w-full max-w-md" role="img" aria-label="Exam preparation illustration">
      <defs>
        <linearGradient id="hg1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".04" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="170" r="150" fill="url(#hg1)" />
      {/* calendar */}
      <g transform="translate(40 60) rotate(-6)">
        <rect width="150" height="150" rx="16" fill="#fff" />
        <rect width="150" height="38" rx="16" fill="var(--accent-500)" />
        <rect y="22" width="150" height="16" fill="var(--accent-500)" />
        <circle cx="38" cy="10" r="5" fill="#fff" />
        <circle cx="112" cy="10" r="5" fill="#fff" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={18 + (i % 4) * 30} y={52 + Math.floor(i / 4) * 30} width="22" height="20" rx="5" fill={i === 6 ? "var(--brand-700)" : "#e7ecf6"} />
        ))}
      </g>
      {/* answer sheet */}
      <g transform="translate(190 40) rotate(5)">
        <rect width="170" height="220" rx="16" fill="#fff" />
        <rect x="20" y="22" width="100" height="10" rx="5" fill="var(--brand-700)" />
        <rect x="20" y="40" width="70" height="8" rx="4" fill="#cfd8ea" />
        {[0, 1, 2, 3].map((r) => (
          <g key={r} transform={`translate(20 ${70 + r * 36})`}>
            <rect width="130" height="8" rx="4" fill="#e7ecf6" />
            {[0, 1, 2, 3].map((c) => (
              <circle key={c} cx={10 + c * 28} cy="22" r="7" fill={c === (r + 1) % 4 ? "var(--brand-700)" : "none"} stroke="#b9c5de" strokeWidth="2" />
            ))}
          </g>
        ))}
      </g>
      {/* target / check */}
      <g transform="translate(300 230)">
        <circle r="44" fill="var(--accent-500)" />
        <circle r="30" fill="none" stroke="#fff" strokeWidth="4" opacity=".6" />
        <path d="m-15 1 10 10 20-22" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
