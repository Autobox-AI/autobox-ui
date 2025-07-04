// Web Worker for heavy data processing
// This worker handles computationally expensive tasks off the main thread

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data, id } = event.data

  switch (type) {
    case 'PROCESS_METRICS':
      processMetrics(data, id)
      break
    case 'PARSE_JSON':
      parseJSON(data, id)
      break
    case 'SORT_DATA':
      sortData(data, id)
      break
    case 'FILTER_DATA':
      filterData(data, id)
      break
    case 'CALCULATE_STATISTICS':
      calculateStatistics(data, id)
      break
    default:
      self.postMessage({
        type: 'ERROR',
        error: `Unknown message type: ${type}`,
        id,
      })
  }
})

// Process metrics data
function processMetrics(data, id) {
  try {
    const { metrics, type } = data
    const processed = metrics.map((metric) => {
      // Calculate additional statistics
      const values = metric.data?.map((d) => d.value) || []
      const stats = calculateBasicStats(values)

      return {
        ...metric,
        stats,
        processedAt: new Date().toISOString(),
      }
    })

    self.postMessage({
      type: 'METRICS_PROCESSED',
      data: processed,
      id,
    })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      id,
    })
  }
}

// Parse large JSON strings
function parseJSON(data, id) {
  try {
    const { jsonString } = data
    const parsed = JSON.parse(jsonString)

    self.postMessage({
      type: 'JSON_PARSED',
      data: parsed,
      id,
    })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      id,
    })
  }
}

// Sort large datasets
function sortData(data, id) {
  try {
    const { items, key, direction = 'asc' } = data

    const sorted = [...items].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]

      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    self.postMessage({
      type: 'DATA_SORTED',
      data: sorted,
      id,
    })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      id,
    })
  }
}

// Filter large datasets
function filterData(data, id) {
  try {
    const { items, filters } = data

    let filtered = [...items]

    filters.forEach((filter) => {
      const { key, value, operator = 'includes' } = filter

      filtered = filtered.filter((item) => {
        const itemValue = item[key]

        switch (operator) {
          case 'includes':
            return String(itemValue).toLowerCase().includes(String(value).toLowerCase())
          case 'equals':
            return itemValue === value
          case 'startsWith':
            return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase())
          case 'endsWith':
            return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase())
          case 'greaterThan':
            return Number(itemValue) > Number(value)
          case 'lessThan':
            return Number(itemValue) < Number(value)
          default:
            return true
        }
      })
    })

    self.postMessage({
      type: 'DATA_FILTERED',
      data: filtered,
      id,
    })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      id,
    })
  }
}

// Calculate statistics for datasets
function calculateStatistics(data, id) {
  try {
    const { items, numericKeys } = data

    const stats = {}

    numericKeys.forEach((key) => {
      const values = items.map((item) => Number(item[key])).filter((val) => !isNaN(val))

      if (values.length > 0) {
        stats[key] = calculateBasicStats(values)
      }
    })

    self.postMessage({
      type: 'STATISTICS_CALCULATED',
      data: stats,
      id,
    })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      id,
    })
  }
}

// Helper function to calculate basic statistics
function calculateBasicStats(values) {
  if (values.length === 0) return null

  const sorted = [...values].sort((a, b) => a - b)
  const sum = values.reduce((acc, val) => acc + val, 0)
  const mean = sum / values.length
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  return {
    count: values.length,
    sum,
    mean,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    variance,
    stdDev,
    q1: sorted[Math.floor(sorted.length * 0.25)],
    q3: sorted[Math.floor(sorted.length * 0.75)],
  }
}

// Handle errors
self.addEventListener('error', (event) => {
  self.postMessage({
    type: 'ERROR',
    error: event.error.message,
    id: null,
  })
})

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({
    type: 'ERROR',
    error: event.reason,
    id: null,
  })
})
