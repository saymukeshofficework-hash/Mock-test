import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function NotConnectedNotice({ note }: { note?: string }) {
  const { t, locale } = useLanguage()

  return (
    <div className="card border-dashed p-6 sm:p-8">
      <span className="mb-2 inline-block rounded-full bg-lavender-200 px-3 py-1 text-xs font-semibold text-navy-800">
        {t('common.developmentDataLabel')}
      </span>
      <p className="text-sm leading-relaxed text-navy-800/70">
        {locale === 'hi'
          ? 'यह टूल सटीक खगोलीय गणना (ग्रह स्थिति, पंचांग, दशा) पर निर्भर करता है। गलत परिणाम दिखाने से बचने के लिए, जब तक एक वास्तविक गणना इंजन (एफेमेरिस लाइब्रेरी या ज्योतिष API) नहीं जोड़ा जाता, यह अनुभाग केवल आवश्यक इनपुट एकत्र करता है।'
          : 'This tool depends on precise astronomical calculation (planetary positions, panchang, dashas). To avoid showing inaccurate results, this section only collects the required inputs until a real calculation engine (an ephemeris library or astrology API) is connected.'}
      </p>
      {note && <p className="mt-3 text-sm text-navy-800/70">{note}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/book" className="btn-primary !px-5 !py-2.5 text-xs">
          {t('common.bookAstrologyConsultation')}
        </Link>
        <Link to="/tools" className="btn-secondary !px-5 !py-2.5 text-xs">
          {t('common.exploreTools')}
        </Link>
      </div>
    </div>
  )
}
