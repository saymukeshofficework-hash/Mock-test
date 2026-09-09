import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/layout/TopNav'
import { BUILTIN_TEMPLATES } from '../templates/builtins'
import { deleteUserTemplate, listUserTemplates } from '../storage/templatesRepo'

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [refresh, setRefresh] = useState(0)
  const userTemplates = listUserTemplates()
  void refresh

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">टेम्पलेट</h1>
        <p className="text-sm text-slate-500 mb-6">किसी भी प्रारूप को चुनें और तुरंत संपादन प्रारंभ करें। सभी टेम्पलेट पूर्णतः संपादन योग्य हैं।</p>

        {userTemplates.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-slate-600 mb-2">मेरे टेम्पलेट</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {userTemplates.map((t) => (
                <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
                  <div className="font-medium text-slate-800">{t.name}</div>
                  <div className="text-xs text-slate-500 mt-1 flex-1">{t.templateDescription}</div>
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <button className="text-brand-600 hover:underline font-medium" onClick={() => navigate(`/editor/new?template=${t.id}`)}>
                      उपयोग करें
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => {
                        if (confirm('टेम्पलेट हटाएं?')) {
                          deleteUserTemplate(t.id)
                          setRefresh((r) => r + 1)
                        }
                      }}
                    >
                      हटाएं
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="text-sm font-semibold text-slate-600 mb-2">तैयार टेम्पलेट</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILTIN_TEMPLATES.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col hover:border-brand-400 transition">
              <div className="font-medium text-slate-800">{t.name}</div>
              <div className="text-xs text-slate-500 mt-1 flex-1">{t.description}</div>
              <button
                className="mt-3 text-sm text-white bg-brand-600 hover:bg-brand-700 rounded-lg py-1.5 font-medium"
                onClick={() => navigate(`/editor/new?template=${t.id}`)}
              >
                टेम्पलेट उपयोग करें
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
