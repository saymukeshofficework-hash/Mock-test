import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDocument } from '../storage/documentsRepo'
import { getSchoolSettings } from '../storage/schoolSettingsRepo'
import { buildVariableContext } from '../utils/variables'
import DocumentCanvas from '../components/editor/DocumentCanvas'
import { downloadDocumentAsPdf } from '../pdf/exportPdf'

export default function PreviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)
  const doc = id ? getDocument(id) : undefined
  const settings = useMemo(() => getSchoolSettings(), [])
  const variableContext = useMemo(() => (doc ? buildVariableContext(settings, doc) : {}), [settings, doc])

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-slate-500">दस्तावेज़ नहीं मिला।</p>
        <Link to="/" className="text-brand-600 hover:underline">
          डैशबोर्ड पर लौटें
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-200">
      <header className="no-print sticky top-0 z-20 bg-white border-b border-slate-200 h-14 flex items-center px-4 gap-3">
        <button onClick={() => navigate(`/editor/${doc.id}`)} className="text-sm text-slate-500 hover:text-slate-800">
          ← वापस संपादित करें
        </button>
        <div className="flex-1" />
        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
        >
          प्रिंट करें
        </button>
        <button
          disabled={downloading}
          onClick={async () => {
            setDownloading(true)
            try {
              await downloadDocumentAsPdf(doc, doc.name)
            } finally {
              setDownloading(false)
            }
          }}
          className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
        >
          {downloading ? 'PDF बन रहा है...' : 'PDF डाउनलोड करें'}
        </button>
      </header>

      <DocumentCanvas
        doc={doc}
        readOnly
        selectedId={null}
        onSelect={() => {}}
        onElementsChange={() => {}}
        variableContext={variableContext}
      />
    </div>
  )
}
