import { useRef, useState } from 'react'
import TopNav from '../components/layout/TopNav'
import { getSchoolSettings, saveSchoolSettings } from '../storage/schoolSettingsRepo'
import type { SchoolSettings } from '../types/school'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const FIELD = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm'
const LABEL = 'block text-sm font-medium text-slate-600 mb-1'

export default function SettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings>(() => getSchoolSettings())
  const [saved, setSaved] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const govtLogoRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof SchoolSettings>(key: K, value: SchoolSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    saveSchoolSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">विद्यालय सेटिंग</h1>
        <p className="text-sm text-slate-500 mb-6">यह जानकारी सभी दस्तावेज़ों में {'{{'}...{'}}'}  चर के माध्यम से स्वतः भर जाएगी।</p>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div>
            <span className={LABEL}>विद्यालय का नाम</span>
            <input className={FIELD} value={settings.school_name} onChange={(e) => set('school_name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={LABEL}>शिक्षा केंद्र</span>
              <input className={FIELD} value={settings.education_center} onChange={(e) => set('education_center', e.target.value)} />
            </div>
            <div>
              <span className={LABEL}>विकासखंड</span>
              <input className={FIELD} value={settings.block} onChange={(e) => set('block', e.target.value)} />
            </div>
            <div>
              <span className={LABEL}>जिला</span>
              <input className={FIELD} value={settings.district} onChange={(e) => set('district', e.target.value)} />
            </div>
            <div>
              <span className={LABEL}>राज्य</span>
              <input className={FIELD} value={settings.state} onChange={(e) => set('state', e.target.value)} />
            </div>
            <div>
              <span className={LABEL}>यू-डाइस कोड</span>
              <input className={FIELD} value={settings.udise_code} onChange={(e) => set('udise_code', e.target.value)} />
            </div>
            <div>
              <span className={LABEL}>मोबाइल नंबर</span>
              <input className={FIELD} value={settings.mobile} onChange={(e) => set('mobile', e.target.value)} />
            </div>
            <div>
              <span className={LABEL}>ईमेल</span>
              <input className={FIELD} value={settings.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <span className={LABEL}>प्रधानाध्यापक का नाम</span>
              <input className={FIELD} value={settings.principal_name} onChange={(e) => set('principal_name', e.target.value)} />
            </div>
            <div>
              <span className={LABEL}>शिक्षक का नाम</span>
              <input className={FIELD} value={settings.teacher_name} onChange={(e) => set('teacher_name', e.target.value)} />
            </div>
            <div>
              <span className={LABEL}>डिफ़ॉल्ट स्थान</span>
              <input className={FIELD} value={settings.default_place} onChange={(e) => set('default_place', e.target.value)} />
            </div>
          </div>
          <div>
            <span className={LABEL}>पता</span>
            <textarea className={FIELD} value={settings.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div>
            <span className={LABEL}>दिनांक प्रारूप</span>
            <select className={FIELD} value={settings.date_format} onChange={(e) => set('date_format', e.target.value as SchoolSettings['date_format'])}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <span className={LABEL}>विद्यालय लोगो</span>
              {settings.logo_url && <img src={settings.logo_url} alt="लोगो" className="w-16 h-16 object-contain mb-2 border rounded" />}
              <button className="text-sm px-3 py-1.5 border rounded-lg hover:bg-slate-50" onClick={() => logoRef.current?.click()}>
                अपलोड करें
              </button>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (f) set('logo_url', await fileToDataUrl(f))
                }}
              />
            </div>
            <div>
              <span className={LABEL}>शासकीय चिन्ह</span>
              {settings.govt_logo_url && <img src={settings.govt_logo_url} alt="चिन्ह" className="w-16 h-16 object-contain mb-2 border rounded" />}
              <button className="text-sm px-3 py-1.5 border rounded-lg hover:bg-slate-50" onClick={() => govtLogoRef.current?.click()}>
                अपलोड करें
              </button>
              <input
                ref={govtLogoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (f) set('govt_logo_url', await fileToDataUrl(f))
                }}
              />
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium">
              सहेजें
            </button>
            {saved && <span className="text-sm text-green-600">सहेजा गया ✓</span>}
          </div>
        </div>
      </main>
    </div>
  )
}
