'use client'

import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Edit, MessageSquare, Save, User, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Agent {
  id: string
  agent_id: string
  name: string
  instruction?: string
  role?: string
  description?: string
  backstory?: string
  type?: 'SYSTEM' | 'AGENT'
}

interface Trace {
  from: string
  to: string
  content: string
  is_system_trace: boolean
  created_at: string
}

export default function AgentDetailPage() {
  const params = useParams()
  const { rid, agentId } = params
  const { toast } = useToast()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [traces, setTraces] = useState<Trace[]>([])
  const [loading, setLoading] = useState(true)
  const [tracesLoading, setTracesLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    instruction: '',
    role: '',
    description: '',
    backstory: '',
  })

  useEffect(() => {
    fetchAgent()
    fetchAgentTraces()
  }, [agentId])

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/runs/${rid}/agents/${agentId}`)
      if (response.ok) {
        const data = await response.json()
        setAgent(data)
        setEditForm({
          name: data.name,
          instruction: data.instruction || '',
          role: data.role || '',
          description: data.description || '',
          backstory: data.backstory || '',
        })
      }
    } catch (error) {
      console.error('Error fetching agent:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAgentTraces = async () => {
    try {
      const response = await fetch(`/api/runs/${rid}/agents/${agentId}/traces`)
      if (response.ok) {
        const data = await response.json()
        setTraces(data.traces || [])
      }
    } catch (error) {
      console.error('Error fetching agent traces:', error)
    } finally {
      setTracesLoading(false)
    }
  }

  const handleSave = async () => {
    if (!agent) return

    setSaving(true)
    try {
      const response = await fetch(`/api/runs/${rid}/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          instruction: editForm.instruction,
          role: editForm.role,
          description: editForm.description,
          backstory: editForm.backstory,
        }),
      })

      if (response.ok) {
        const updatedAgent = await response.json()
        setAgent(updatedAgent)
        setEditing(false)
        toast({
          title: 'Agent updated',
          description: 'Agent settings have been saved successfully.',
        })
      } else {
        throw new Error('Failed to update agent')
      }
    } catch (error) {
      console.error('Error updating agent:', error)
      toast({
        title: 'Error',
        description: 'Failed to update agent settings.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (agent) {
      setEditForm({
        name: agent.name,
        instruction: agent.instruction || '',
        role: agent.role || '',
        description: agent.description || '',
        backstory: agent.backstory || '',
      })
    }
    setEditing(false)
  }

  const getAgentTypeFromId = (agentId: string) => {
    const agentName = agent?.name.toLowerCase() || ''
    if (agentName.includes('orchestrator')) return 'orchestrator'
    if (agentName.includes('planner')) return 'planner'
    if (agentName.includes('evaluator')) return 'evaluator'
    if (agentName.includes('reporter')) return 'reporter'
    return 'agent'
  }

  const getAgentTypeColor = (type: string) => {
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

  if (!agent) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Agent Not Found</h1>
          <p className="text-gray-600">The requested agent could not be found.</p>
        </div>
      </div>
    )
  }

  const agentType = getAgentTypeFromId(agent.id)

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/runs/${rid}`}>Run</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="font-medium">{agent.name}</span>
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
                    {editing ? 'Edit Agent' : agent.name}
                  </CardTitle>
                  {/* <CardDescription>Settings</CardDescription> */}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getAgentTypeColor(agentType)}>{agentType}</Badge>
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
                  <Label htmlFor="name" className="text-white font-bold">
                    Name
                  </Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-200">{agent.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="role" className="text-white font-bold">
                    Role
                  </Label>
                  {editing ? (
                    <Input
                      id="role"
                      value={editForm.role}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                      placeholder="Enter agent role..."
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-200">{agent.role || 'No role set'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="text-white font-bold">
                    Description
                  </Label>
                  {editing ? (
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Enter agent description..."
                      className="mt-1 min-h-20"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-200 whitespace-pre-wrap">
                      {agent.description || 'No description set'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="backstory" className="text-white font-bold">
                    Backstory
                  </Label>
                  {editing ? (
                    <Textarea
                      id="backstory"
                      value={editForm.backstory}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, backstory: e.target.value }))
                      }
                      placeholder="Enter agent backstory..."
                      className="mt-1 min-h-24"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-200 whitespace-pre-wrap">
                      {agent.backstory || 'No backstory set'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="instruction" className="text-white font-bold">
                    Instructions
                  </Label>
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
                    <p className="mt-1 text-sm text-gray-200 whitespace-pre-wrap">
                      {agent.instruction || 'No instructions set'}
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
                <p className="text-center text-gray-500 py-8">No traces found for this agent</p>
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
                  <p className="text-sm font-mono">{agent.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Base Agent ID</Label>
                  <p className="text-sm font-mono">{agent.agent_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <p className="text-sm capitalize">{agentType}</p>
                </div>
                {agent.role && (
                  <div>
                    <Label className="text-xs text-gray-500">Role</Label>
                    <p className="text-sm">{agent.role}</p>
                  </div>
                )}
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
