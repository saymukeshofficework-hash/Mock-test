import { useEffect, useRef } from 'react'

export function useDebouncedEffect(effect: () => void, deps: unknown[], delayMs: number): void {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const handle = setTimeout(effect, delayMs)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
