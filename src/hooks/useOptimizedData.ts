import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

interface UseOptimizedDataOptions<T> {
  fetchFn: () => Promise<T>
  streamFn?: (onData: (data: T) => void, onError: (error: string) => void) => () => void
  debounceMs?: number
  enabled?: boolean
}

export function useOptimizedData<T>({
  fetchFn,
  streamFn,
  debounceMs = 100,
  enabled = true,
}: UseOptimizedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const mounted = useRef(true)
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const cleanupRef = useRef<(() => void) | null>(null)

  // Debounced setter to reduce re-renders
  const debouncedSetData = useCallback(
    (newData: T) => {
      if (!mounted.current) return

      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        if (mounted.current) {
          startTransition(() => {
            setData(newData)
            setError(null)
          })
        }
      }, debounceMs)
    },
    [debounceMs]
  )

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!enabled || !mounted.current) return

    try {
      setLoading(true)
      const result = await fetchFn()
      if (mounted.current) {
        debouncedSetData(result)
      }
    } catch (err) {
      if (!mounted.current) return
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      if (mounted.current) {
        setLoading(false)
      }
    }
  }, [fetchFn, enabled, debouncedSetData])

  // Setup streaming if provided
  useEffect(() => {
    if (!enabled || !streamFn || !mounted.current) return

    setLoading(true)

    const cleanup = streamFn(
      (newData) => {
        if (mounted.current) {
          debouncedSetData(newData)
        }
      },
      (errorMessage) => {
        if (mounted.current) {
          setError(errorMessage)
          setLoading(false)
        }
      }
    )

    cleanupRef.current = cleanup

    return () => {
      cleanup()
    }
  }, [streamFn, enabled, debouncedSetData])

  // Fetch on mount if no streaming
  useEffect(() => {
    if (!streamFn && enabled) {
      fetchData()
    }
  }, [fetchData, streamFn, enabled])

  // Cleanup on unmount
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(debounceTimerRef.current)
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    isPending,
    refetch: fetchData,
  }
}
