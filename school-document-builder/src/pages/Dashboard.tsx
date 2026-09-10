import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/layout/TopNav'
import { deleteDocument, duplicateDocument, listDocuments } from '../storage/documentsRepo'

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [refresh, setRefresh] = useState(0)
  const documents = useMemo(() => listDocuments().slice(0, 6), [refresh])

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <button
            onClick={() => navigate('/editor/new?template=blank')}
            className="col-span-2 md:col-span-1 bg-brand-600 hover:bg-brand-700 text-white rounded-xl p-5 text-left shadow-sm transition"
          >
            <div className="text-2xl mb-1">+</div>
            <div className="font-semibold">नया दस्तावेज़</div>
            <div className="text-xs text-brand-100">शुरुआत से बनाएं</div>
          </button>
          <Link to="/templates" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-400 shadow-sm transition">
            <div className="text-2xl mb-1">📄</div>
            <div className="font-semibold text-slate-800">टेम्पलेट</div>
            <div className="text-xs text-slate-500">तैयार प्रारूप उपयोग करें</div>
          </Link>
          <Link to="/documents" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-400 shadow-sm transition">
            <div className="text-2xl mb-1">🗂</div>
            <div className="font-semibold text-slate-800">मेरे दस्तावेज़</div>
            <div className="text-xs text-slate-500">सभी सहेजे गए दस्तावेज़</div>
          </Link>
          <Link to="/settings" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-400 shadow-sm transition">
            <div className="text-2xl mb-1">⚙</div>
            <div className="font-semibold text-slate-800">विद्यालय सेटिंग</div>
            <div className="text-xs text-slate-500">विद्यालय की जानकारी संपादित करें</div>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-700">हाल के दस्तावेज़</h2>
          <Link to="/documents" className="text-sm text-brand-600 hover:underline">
            सभी देखें →
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400">
            अभी तक कोई दस्तावेज़ नहीं बनाया गया है।
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="font-medium text-slate-800 truncate">{doc.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{formatDateTime(doc.updatedAt)}</div>
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <Link to={`/editor/${doc.id}`} className="text-brand-600 hover:underline">
                    खोलें
                  </Link>
                  <button
                    className="text-slate-500 hover:underline"
                    onClick={() => {
                      duplicateDocument(doc.id)
                      setRefresh((r) => r + 1)
                    }}
                  >
                    प्रतिलिपि
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => {
                      if (confirm('क्या आप वाकई इस दस्तावेज़ को हटाना चाहते हैं?')) {
                        deleteDocument(doc.id)
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
        )}
      </main>
    </div>
  )
}
