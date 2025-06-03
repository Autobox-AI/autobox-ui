'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Metric, MetricTemplate, MetricType } from '@/types/metrics'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

interface MetricTemplateFormProps {
  template?: MetricTemplate
  onSubmit: (template: MetricTemplate) => void
  onCancel: () => void
}

export function MetricTemplateForm({
  template,
  onSubmit,
  onCancel,
}: MetricTemplateFormProps) {
  const [metrics, setMetrics] = useState<Metric[]>(
    template?.metrics || [
      {
        name: '',
        description: '',
        prometheus_type: 'counter',
        unit: '',
      },
    ]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ metrics })
  }

  const addMetric = () => {
    setMetrics([
      ...metrics,
      {
        name: '',
        description: '',
        prometheus_type: 'counter',
        unit: '',
      },
    ])
  }

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index))
  }

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...metrics]
    newMetrics[index] = {
      ...newMetrics[index],
      [field]: value,
    }
    setMetrics(newMetrics)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Metric {index + 1}</h3>
              {metrics.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetric(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={metric.name}
                  onChange={(e) => updateMetric(index, 'name', e.target.value)}
                  placeholder="metric_name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={metric.prometheus_type}
                  onValueChange={(value) =>
                    updateMetric(index, 'prometheus_type', value as MetricType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="counter">Counter</SelectItem>
                    <SelectItem value="gauge">Gauge</SelectItem>
                    <SelectItem value="histogram">Histogram</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={metric.description}
                onChange={(e) => updateMetric(index, 'description', e.target.value)}
                placeholder="Describe what this metric measures..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Unit</label>
              <Input
                value={metric.unit}
                onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                placeholder="e.g., seconds, bytes, percentage"
                required
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addMetric}>
        <Plus className="mr-2 h-4 w-4" />
        Add Metric
      </Button>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Template</Button>
      </div>
    </form>
  )
}
