import { useEffect, useRef } from 'react'
import type { Align } from '../../types/document'

interface RichTextProps {
  html: string
  onChange: (html: string) => void
  placeholder?: string
  align?: Align
  className?: string
  style?: React.CSSProperties
  tag?: 'div' | 'span'
  onFocus?: () => void
  readOnly?: boolean
}

export default function RichText({
  html,
  onChange,
  placeholder = 'यहाँ लिखें...',
  align,
  className = '',
  style,
  tag = 'div',
  onFocus,
  readOnly = false,
}: RichTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const lastSet = useRef<string>('')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (document.activeElement === el) return
    if (html === lastSet.current) return
    el.innerHTML = html || ''
    lastSet.current = html || ''
  }, [html])

  const Tag = tag as unknown as 'div'

  if (readOnly) {
    return (
      <Tag
        className={`rt-content ${className}`}
        style={{ textAlign: align, ...style }}
        dangerouslySetInnerHTML={{ __html: html || '' }}
      />
    )
  }

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={`rt-content ${className}`}
      style={{ textAlign: align, minHeight: '1.4em', ...style }}
      onFocus={onFocus}
      onInput={(e) => {
        const value = (e.target as HTMLDivElement).innerHTML
        lastSet.current = value
        onChange(value)
      }}
      onBlur={(e) => {
        const value = (e.target as HTMLDivElement).innerHTML
        lastSet.current = value
        onChange(value)
      }}
    />
  )
}
