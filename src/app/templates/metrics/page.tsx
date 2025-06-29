'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { MetricTemplate } from '@/types/metrics'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { MetricTemplateForm } from './metric-template-form'
import { MetricTemplateList } from './metric-template-list'

export default function MetricsTemplatesPage() {
  const [templates, setTemplates] = useState<MetricTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MetricTemplate | null>(null)
  const { toast } = useToast()

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/templates/metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      const data = await response.json()
      setTemplates(data)
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch metric templates',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleCreate = async (template: MetricTemplate) => {
    try {
      const response = await fetch('/api/templates/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      })

      if (!response.ok) {
        throw new Error('Failed to create template')
      }

      toast({
        title: 'Success',
        description: 'Metric template created successfully',
      })
      setIsFormOpen(false)
      fetchTemplates()
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to create metric template',
        variant: 'destructive',
      })
    }
  }

  const handleUpdate = async (template: MetricTemplate) => {
    try {
      const response = await fetch('/api/templates/metrics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      })

      if (!response.ok) {
        throw new Error('Failed to update template')
      }

      toast({
        title: 'Success',
        description: 'Metric template updated successfully',
      })
      setEditingTemplate(null)
      fetchTemplates()
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to update metric template',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/metrics?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete template')
      }

      toast({
        title: 'Success',
        description: 'Metric template deleted successfully',
      })
      fetchTemplates()
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to delete metric template',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Metric Templates</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTemplateForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
          </CardContent>
        </Card>
      )}

      {editingTemplate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Template</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricTemplateForm
              template={editingTemplate}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTemplate(null)}
            />
          </CardContent>
        </Card>
      )}

      <MetricTemplateList
        templates={templates}
        isLoading={isLoading}
        onEdit={setEditingTemplate}
        onDelete={handleDelete}
      />
    </div>
  )
}
