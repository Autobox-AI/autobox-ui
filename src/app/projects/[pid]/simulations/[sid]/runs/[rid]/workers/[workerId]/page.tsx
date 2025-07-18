'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Edit, Save, X, MessageSquare, User } from 'lucide-react'

interface Worker {
  id: string
  agent_id: string
  name: string
  instruction?: string
}

interface Trace {
  from: string
  to: string
  content: string
  is_system_trace: boolean
  created_at: string
}

export default function WorkerDetailPage() {
  const params = useParams()
  const { pid, sid, rid, workerId } = params
  const { toast } = useToast()

  const [worker, setWorker] = useState<Worker | null>(null)
  const [traces, setTraces] = useState<Trace[]>([])
  const [loading, setLoading] = useState(true)
  const [tracesLoading, setTracesLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', instruction: '' })

  useEffect(() => {
    fetchWorker()
    fetchWorkerTraces()
  }, [workerId])

  const fetchWorker = async () => {
    try {
      const response = await fetch(`/api/runs/${rid}/workers/${workerId}`)
      if (response.ok) {
        const data = await response.json()
        setWorker(data)
        setEditForm({ name: data.name, instruction: data.instruction || '' })
      }
    } catch (error) {
      console.error('Error fetching worker:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkerTraces = async () => {
    try {
      const response = await fetch(`/api/runs/${rid}/workers/${workerId}/traces`)
      if (response.ok) {
        const data = await response.json()
        setTraces(data.traces || [])
      }
    } catch (error) {
      console.error('Error fetching worker traces:', error)
    } finally {
      setTracesLoading(false)
    }
  }

  const handleSave = async () => {
    if (!worker) return

    setSaving(true)
    try {
      const response = await fetch(`/api/runs/${rid}/workers/${workerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          instruction: editForm.instruction,
        }),
      })

      if (response.ok) {
        const updatedWorker = await response.json()
        setWorker(updatedWorker)
        setEditing(false)
        toast({
          title: 'Worker updated',
          description: 'Worker settings have been saved successfully.',
        })
      } else {
        throw new Error('Failed to update worker')
      }
    } catch (error) {
      console.error('Error updating worker:', error)
      toast({
        title: 'Error',
        description: 'Failed to update worker settings.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (worker) {
      setEditForm({ name: worker.name, instruction: worker.instruction || '' })
    }
    setEditing(false)
  }

  const getWorkerTypeFromId = (workerId: string) => {
    // This would need to be enhanced based on how worker types are determined
    // For now, we'll use a simple heuristic
    const workerName = worker?.name.toLowerCase() || ''
    if (workerName.includes('orchestrator')) return 'orchestrator'
    if (workerName.includes('planner')) return 'planner'
    if (workerName.includes('evaluator')) return 'evaluator'
    if (workerName.includes('reporter')) return 'reporter'
    return 'worker'
  }

  const getWorkerTypeColor = (type: string) => {
    switch (type) {
      case 'orchestrator':
        return 'bg-purple-100 text-purple-800'
      case 'planner':
        return 'bg-blue-100 text-blue-800'
      case 'evaluator':
        return 'bg-green-100 text-green-800'
      case 'reporter':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Worker Not Found</h1>
          <p className="text-gray-600">The requested worker could not be found.</p>
        </div>
      </div>
    )
  }

  const workerType = getWorkerTypeFromId(worker.id)

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${pid}`}>Project</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${pid}/simulations/${sid}`}>Simulation</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${pid}/simulations/${sid}/runs/${rid}`}>
              Run
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="font-medium">{worker.name}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {editing ? 'Edit Agent' : worker.name}
                  </CardTitle>
                  <CardDescription>Agent configuration and settings</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getWorkerTypeColor(workerType)}>{workerType}</Badge>
                  {!editing && (
                    <Button onClick={() => setEditing(true)} size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{worker.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="instruction">Instructions</Label>
                  {editing ? (
                    <Textarea
                      id="instruction"
                      value={editForm.instruction}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, instruction: e.target.value }))
                      }
                      placeholder="Enter agent instructions..."
                      className="mt-1 min-h-32"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {worker.instruction || 'No instructions set'}
                    </p>
                  )}
                </div>

                {editing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Agent Traces
              </CardTitle>
              <CardDescription>Messages sent to and from this agent</CardDescription>
            </CardHeader>
            <CardContent>
              {tracesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : traces.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No traces found for this worker</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {traces.map((trace, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trace.from}</span>
                          <span className="text-gray-500">→</span>
                          <span className="font-medium">{trace.to}</span>
                          {trace.is_system_trace && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(trace.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{trace.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Agent ID</Label>
                  <p className="text-sm font-mono">{worker.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Base Agent ID</Label>
                  <p className="text-sm font-mono">{worker.agent_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <p className="text-sm capitalize">{workerType}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Traces</Label>
                  <p className="text-sm">{traces.length} messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
