'use client'

// Central export for all lazy-loaded components
// This reduces bundle size by loading components only when needed

// Re-export charts (already lazy-loaded)
export {
  LineChart,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from './LazyCharts'

// Re-export tables and lists
export { ToolsTable, VirtualizedList } from './LazyTable'

// Re-export metrics components
export { CounterMetric, GaugeMetric, RunGaugeMetric, HistogramMetric } from './LazyMetrics'

// Re-export modals
export { NewSimulationModal, InstructAgentModal, ConfirmAbortModal } from './LazyModals'
