import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopNav from '../components/layout/TopNav'
import { deleteDocument, duplicateDocument, listDocuments, renameDocument } from '../storage/documentsRepo'

type Filter = 'all' | 'today' | 'week' | 'month'

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function matchesFilter(ts: number, filter: Filter): boolean {
  if (filter === 'all') return true
  const now = Date.now()
  const diffDays = (now - ts) / (1000 * 60 * 60 * 24)
  if (filter === 'today') return diffDays < 1
  if (filter === 'week') return diffDays < 7
  return diffDays < 31
}

export default function MyDocumentsPage() {
  const navigate = useNavigate()
  const [refresh, setRefresh] = useState(0)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const documents = useMemo(() => {
    void refresh
    return listDocuments().filter(
      (d) => d.name.toLowerCase().includes(query.toLowerCase()) && matchesFilter(d.updatedAt, filter),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, query, filter])

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-xl font-semibold text-slate-800">मेरे दस्तावेज़</h1>
          <button
            onClick={() => navigate('/editor/new?template=blank')}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
          >
            + नया दस्तावेज़
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <input
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
            placeholder="दस्तावेज़ खोजें..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex gap-1 text-sm">
            {([
              ['all', 'सभी'],
              ['today', 'आज'],
              ['week', 'इस सप्ताह'],
              ['month', 'इस माह'],
            ] as [Filter, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg border ${filter === key ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 hover:bg-slate-100'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400">
            कोई दस्तावेज़ नहीं मिला।
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  {renamingId === doc.id ? (
                    <input
                      autoFocus
                      className="border border-slate-300 rounded px-2 py-1 text-sm w-full max-w-xs"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => {
                        renameDocument(doc.id, renameValue || doc.name)
                        setRenamingId(null)
                        setRefresh((r) => r + 1)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                      }}
                    />
                  ) : (
                    <div className="font-medium text-slate-800 truncate">{doc.name}</div>
                  )}
                  <div className="text-xs text-slate-400">{doc.docType} · {formatDateTime(doc.updatedAt)}</div>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <Link to={`/editor/${doc.id}`} className="text-brand-600 hover:underline">
                    खोलें
                  </Link>
                  <button
                    className="text-slate-500 hover:underline"
                    onClick={() => {
                      setRenamingId(doc.id)
                      setRenameValue(doc.name)
                    }}
                  >
                    नाम बदलें
                  </button>
                  <button
                    className="text-slate-500 hover:underline"
                    onClick={() => {
                      duplicateDocument(doc.id)
                      setRefresh((r) => r + 1)
                    }}
                  >
                    प्रतिलिपि
                  </button>
                  <Link to={`/preview/${doc.id}`} className="text-slate-500 hover:underline">
                    PDF निर्यात
                  </Link>
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
