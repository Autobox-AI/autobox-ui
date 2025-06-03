'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { MetricTemplate } from '@/types/metrics'
import { Edit2, Trash2 } from 'lucide-react'

interface MetricTemplateListProps {
  templates: MetricTemplate[]
  isLoading: boolean
  onEdit: (template: MetricTemplate) => void
  onDelete: (id: string) => void
}

export function MetricTemplateList({
  templates,
  isLoading,
  onEdit,
  onDelete,
}: MetricTemplateListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No metric templates found. Create your first template to get started.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Template {template.id}</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(template)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => template.id && onDelete(template.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {template.metrics.map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{metric.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {metric.prometheus_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{metric.unit}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {metric.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
