import { useCallback, useEffect, useRef, useState } from 'react'

interface WorkerMessage {
  type: string
  data?: any
  id: string
}

interface WorkerResponse {
  type: string
  data?: any
  error?: string
  id: string
}

interface UseWebWorkerOptions {
  onMessage?: (response: WorkerResponse) => void
  onError?: (error: string) => void
}

export function useWebWorker(options: UseWebWorkerOptions = {}) {
  const workerRef = useRef<Worker | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const pendingRequests = useRef<
    Map<string, { resolve: (value: any) => void; reject: (reason: any) => void }>
  >(new Map())

  // Initialize worker
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Worker) {
      workerRef.current = new Worker('/worker.js')

      workerRef.current.onmessage = (event) => {
        const response: WorkerResponse = event.data

        if (response.type === 'ERROR') {
          const pendingRequest = pendingRequests.current.get(response.id)
          if (pendingRequest) {
            pendingRequest.reject(new Error(response.error))
            pendingRequests.current.delete(response.id)
          }
          options.onError?.(response.error || 'Unknown error')
          setIsProcessing(false)
          return
        }

        const pendingRequest = pendingRequests.current.get(response.id)
        if (pendingRequest) {
          pendingRequest.resolve(response.data)
          pendingRequests.current.delete(response.id)
          setIsProcessing(false)
        }

        options.onMessage?.(response)
      }

      workerRef.current.onerror = (error) => {
        console.error('Web Worker error:', error)
        options.onError?.(error.message)
        setIsProcessing(false)
      }

      setIsReady(true)
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [options])

  // Send message to worker
  const sendMessage = useCallback(
    (type: string, data?: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || !isReady) {
          reject(new Error('Worker not ready'))
          return
        }

        const id = `${type}-${Date.now()}-${Math.random()}`
        pendingRequests.current.set(id, { resolve, reject })

        setIsProcessing(true)

        workerRef.current.postMessage({
          type,
          data,
          id,
        })
      })
    },
    [isReady]
  )

  // Convenience methods for common operations
  const processMetrics = useCallback(
    (metrics: any[], type: string) => {
      return sendMessage('PROCESS_METRICS', { metrics, type })
    },
    [sendMessage]
  )

  const parseJSON = useCallback(
    (jsonString: string) => {
      return sendMessage('PARSE_JSON', { jsonString })
    },
    [sendMessage]
  )

  const sortData = useCallback(
    (items: any[], key: string, direction: 'asc' | 'desc' = 'asc') => {
      return sendMessage('SORT_DATA', { items, key, direction })
    },
    [sendMessage]
  )

  const filterData = useCallback(
    (
      items: any[],
      filters: Array<{
        key: string
        value: any
        operator?: 'includes' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan'
      }>
    ) => {
      return sendMessage('FILTER_DATA', { items, filters })
    },
    [sendMessage]
  )

  const calculateStatistics = useCallback(
    (items: any[], numericKeys: string[]) => {
      return sendMessage('CALCULATE_STATISTICS', { items, numericKeys })
    },
    [sendMessage]
  )

  return {
    isReady,
    isProcessing,
    sendMessage,
    processMetrics,
    parseJSON,
    sortData,
    filterData,
    calculateStatistics,
  }
}
