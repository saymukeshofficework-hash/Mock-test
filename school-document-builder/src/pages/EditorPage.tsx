import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { DocumentElement, SchoolDocument } from '../types/document'
import { getDocument, saveDocument } from '../storage/documentsRepo'
import { getUserTemplate } from '../storage/templatesRepo'
import { saveAsTemplate } from '../storage/templatesRepo'
import { getSchoolSettings } from '../storage/schoolSettingsRepo'
import { newBlankDocument, createElement } from '../utils/factory'
import { buildVariableContext } from '../utils/variables'
import { useDebouncedEffect } from '../utils/useDebouncedEffect'
import { findBuiltinTemplate } from '../templates/builtins'
import ElementPalette from '../components/editor/ElementPalette'
import PropertiesPanel from '../components/editor/PropertiesPanel'
import EditorTopBar from '../components/editor/EditorTopBar'
import DocumentCanvas from '../components/editor/DocumentCanvas'
import SaveAsTemplateModal from '../components/editor/SaveAsTemplateModal'

function loadInitialDocument(id: string | undefined, templateParam: string | null): SchoolDocument {
  if (id && id !== 'new') {
    const existing = getDocument(id)
    if (existing) return existing
  }
  if (templateParam) {
    const builtin = findBuiltinTemplate(templateParam)
    if (builtin) {
      const doc = builtin.build()
      return doc
    }
    const userTpl = getUserTemplate(templateParam)
    if (userTpl) {
      const now = Date.now()
      return { ...userTpl, id: crypto.randomUUID(), isTemplate: false, createdAt: now, updatedAt: now }
    }
  }
  return newBlankDocument()
}

export default function EditorPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const templateParam = params.get('template')

  const [doc, setDoc] = useState<SchoolDocument>(() => loadInitialDocument(id, templateParam))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<'elements' | 'canvas' | 'props'>('canvas')

  useEffect(() => {
    setDoc(loadInitialDocument(id, templateParam))
    setSelectedId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const docRef = useRef(doc)
  docRef.current = doc

  useDebouncedEffect(
    () => {
      setSaveStatus('saving')
      const saved = saveDocument(doc)
      if (saved.id !== id) {
        navigate(`/editor/${saved.id}`, { replace: true })
      }
      setTimeout(() => setSaveStatus('saved'), 250)
    },
    [doc],
    600,
  )

  // Flush a synchronous save on tab close / reload so edits made just before
  // navigating away are never lost while the autosave debounce is still pending.
  useEffect(() => {
    const flush = () => saveDocument(docRef.current)
    window.addEventListener('beforeunload', flush)
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [])

  const settings = useMemo(() => getSchoolSettings(), [doc.updatedAt])
  const variableContext = useMemo(() => buildVariableContext(settings, doc), [settings, doc.fields])
  const selectedElement = doc.elements.find((e) => e.id === selectedId) || null

  function addElement(kind: DocumentElement['type']) {
    const el = createElement(kind)
    setDoc((d) => ({ ...d, elements: [...d.elements, el] }))
    setSelectedId(el.id)
    setMobilePanel('canvas')
  }

  function updateElements(elements: DocumentElement[]) {
    setDoc((d) => ({ ...d, elements }))
  }

  function updateSelectedElement(patch: Partial<DocumentElement>) {
    if (!selectedId) return
    setDoc((d) => ({
      ...d,
      elements: d.elements.map((e) => (e.id === selectedId ? ({ ...e, ...patch } as DocumentElement) : e)),
    }))
  }

  function handlePreview() {
    const saved = saveDocument(doc)
    navigate(`/preview/${saved.id}`)
  }

  function handleSaveNow() {
    setSaveStatus('saving')
    const saved = saveDocument(doc)
    if (saved.id !== id) navigate(`/editor/${saved.id}`, { replace: true })
    setTimeout(() => setSaveStatus('saved'), 200)
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <EditorTopBar
        name={doc.name}
        onNameChange={(name) => setDoc((d) => ({ ...d, name }))}
        saveStatus={saveStatus}
        onPreview={handlePreview}
        onSave={handleSaveNow}
        onSaveAsTemplate={() => setShowSaveTemplate(true)}
      />

      <div className="no-print flex md:hidden border-b border-slate-200 bg-white text-sm">
        {(['elements', 'canvas', 'props'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setMobilePanel(p)}
            className={`flex-1 py-2 ${mobilePanel === p ? 'text-brand-600 border-b-2 border-brand-600 font-medium' : 'text-slate-500'}`}
          >
            {p === 'elements' ? 'तत्व' : p === 'canvas' ? 'दस्तावेज़' : 'गुण'}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`no-print w-64 bg-white border-r border-slate-200 overflow-y-auto scrollbar-thin shrink-0 ${mobilePanel === 'elements' ? 'block' : 'hidden'} md:block`}>
          <ElementPalette onAdd={addElement} />
        </aside>

        <main className={`flex-1 overflow-y-auto scrollbar-thin ${mobilePanel === 'canvas' ? 'block' : 'hidden'} md:block`}>
          <DocumentCanvas
            doc={doc}
            readOnly={false}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onElementsChange={updateElements}
            variableContext={variableContext}
          />
        </main>

        <aside className={`no-print w-72 bg-white border-l border-slate-200 overflow-y-auto scrollbar-thin shrink-0 ${mobilePanel === 'props' ? 'block' : 'hidden'} md:block`}>
          <PropertiesPanel
            doc={doc}
            selectedElement={selectedElement}
            onDocChange={(patch) => setDoc((d) => ({ ...d, ...patch }))}
            onElementChange={updateSelectedElement}
          />
        </aside>
      </div>

      {showSaveTemplate && (
        <SaveAsTemplateModal
          defaultName={doc.name}
          onClose={() => setShowSaveTemplate(false)}
          onSave={(name, description) => saveAsTemplate(doc, name, description)}
        />
      )}
    </div>
  )
}
