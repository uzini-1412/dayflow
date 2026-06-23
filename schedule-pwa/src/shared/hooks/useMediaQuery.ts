import { useEffect, useState } from 'react'

/** 미디어쿼리 매칭 여부 (반응형 분기용) */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Tailwind md(768px) 기준: 태블릿 이상이면 true */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)')
}
