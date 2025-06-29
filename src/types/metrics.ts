export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary'

export interface Metric {
  name: string
  description: string
  type: MetricType
  unit: string
}

export interface MetricTemplate {
  id?: string
  metrics: Metric[]
  created_at?: string
  updated_at?: string
}
