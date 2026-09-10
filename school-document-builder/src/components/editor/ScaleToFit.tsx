import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Shrinks its child to fit the available width (e.g. an A4 page on a phone
 * screen) while leaving it at natural size whenever it already fits, so
 * desktop layout is untouched. Never scales up beyond 1.
 */
export default function ScaleToFit({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const update = () => {
      const containerWidth = outer.clientWidth
      const naturalWidth = inner.offsetWidth
      const naturalHeight = inner.offsetHeight
      if (!naturalWidth || !containerWidth) return
      const nextScale = Math.min(1, containerWidth / naturalWidth)
      setScale(nextScale)
      setSize({ w: naturalWidth * nextScale, h: naturalHeight * nextScale })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(outer)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [children])

  const scaled = scale < 0.999

  return (
    <div ref={outerRef} className="scale-fit-outer w-full flex justify-center">
      <div style={size ? { width: size.w, height: size.h } : undefined} className="scale-fit-box relative">
        <div
          ref={innerRef}
          className="scale-fit-inner"
          style={
            scaled
              ? { transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    </div>
  )
}
