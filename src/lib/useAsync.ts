import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
}

/**
 * Laddar data från det krypterade lagret. Varje läsning innebär dekryptering,
 * så vyerna hämtar en gång och laddar om explicit efter en skrivning.
 */
export function useAsync<T>(
  load: () => Promise<T>,
  deps: React.DependencyList = [],
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    loading: true,
    error: null,
  })
  const [nonce, setNonce] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true }))
    run()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: undefined, loading: false, error })
      })
    return () => {
      cancelled = true
    }
  }, [run, nonce])

  return { ...state, reload: useCallback(() => setNonce((n) => n + 1), []) }
}
