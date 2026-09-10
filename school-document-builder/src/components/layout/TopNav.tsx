import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'डैशबोर्ड' },
  { to: '/templates', label: 'टेम्पलेट' },
  { to: '/documents', label: 'मेरे दस्तावेज़' },
  { to: '/settings', label: 'विद्यालय सेटिंग' },
]

export default function TopNav() {
  const location = useLocation()
  return (
    <header className="bg-brand-700 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6 flex-wrap">
        <Link to="/" className="font-devanagari">
          <div className="font-bold text-lg leading-tight">सूचना एवं पत्र निर्माण प्रणाली</div>
          <div className="text-[11px] text-brand-100">Mukesh द्वारा निर्मित · Version 3.2001.25</div>
        </Link>
        <nav className="flex items-center gap-1 ml-auto text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`px-3 py-1.5 rounded-lg transition ${
                location.pathname === n.to ? 'bg-white text-brand-700 font-medium' : 'hover:bg-brand-600'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
