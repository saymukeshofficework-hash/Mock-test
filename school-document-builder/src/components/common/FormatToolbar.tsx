interface FormatToolbarProps {
  onInsertVariable?: () => void
}

const BTN = 'px-2 py-1 text-sm rounded hover:bg-slate-200 active:bg-slate-300 border border-transparent'

function exec(command: string, value?: string) {
  document.execCommand(command, false, value)
}

export default function FormatToolbar({ onInsertVariable }: FormatToolbarProps) {
  const btn = (label: string, title: string, command: string, value?: string) => (
    <button
      type="button"
      title={title}
      className={BTN}
      onMouseDown={(e) => {
        e.preventDefault()
        exec(command, value)
      }}
    >
      {label}
    </button>
  )
  return (
    <div className="flex flex-wrap items-center gap-0.5 bg-white border border-slate-200 rounded-lg shadow-sm px-1 py-1 no-print">
      {btn('B', 'बोल्ड', 'bold')}
      <span className="italic">{btn('I', 'इटैलिक', 'italic')}</span>
      <span className="underline">{btn('U', 'रेखांकित', 'underline')}</span>
      <div className="w-px h-5 bg-slate-200 mx-1" />
      {btn('⟸', 'बाएं संरेखित', 'justifyLeft')}
      {btn('⟺', 'केंद्र संरेखित', 'justifyCenter')}
      {btn('⟹', 'दाएं संरेखित', 'justifyRight')}
      <div className="w-px h-5 bg-slate-200 mx-1" />
      <select
        title="फॉन्ट आकार"
        className="text-sm border border-slate-200 rounded px-1 py-0.5"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) exec('fontSize', e.target.value)
          e.target.value = ''
        }}
      >
        <option value="" disabled>
          आकार
        </option>
        <option value="2">छोटा</option>
        <option value="3">सामान्य</option>
        <option value="4">मध्यम</option>
        <option value="5">बड़ा</option>
        <option value="6">अति बड़ा</option>
      </select>
      {btn('x²', 'सुपरस्क्रिप्ट', 'superscript')}
      {btn('x₂', 'सबस्क्रिप्ट', 'subscript')}
      {btn('•', 'बुलेट सूची', 'insertUnorderedList')}
      {btn('1.', 'क्रमांकित सूची', 'insertOrderedList')}
      {onInsertVariable && (
        <>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button
            type="button"
            title="चर जोड़ें"
            className={`${BTN} text-brand-600 font-medium`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onInsertVariable}
          >
            {'{{ }}'} चर
          </button>
        </>
      )}
    </div>
  )
}
