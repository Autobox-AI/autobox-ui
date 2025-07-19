'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Search, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

interface Agent {
  id: string
  agent_id: string
  name: string
  instruction?: string
  type?: 'SYSTEM' | 'AGENT'
}

interface AgentsTabProps {
  runId: string
  agents: Agent[]
  loading: boolean
  error: string | null
}

export default function AgentsTab({ runId, agents, loading, error }: AgentsTabProps) {
  const params = useParams()
  const [typeFilter, setTypeFilter] = useState<'all' | 'SYSTEM' | 'AGENT'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getAgentTypeFromName = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('orchestrator')) return 'orchestrator'
    if (lowerName.includes('planner')) return 'planner'
    if (lowerName.includes('evaluator')) return 'evaluator'
    if (lowerName.includes('reporter')) return 'reporter'
    return 'worker'
  }

  const getAgentCategory = (agent: Agent) => {
    // Use explicit type if available, otherwise infer from name
    if (agent.type) {
      return agent.type
    }
    const type = getAgentTypeFromName(agent.name)
    return type === 'worker' ? 'AGENT' : 'SYSTEM'
  }

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'orchestrator':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'planner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'evaluator':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'reporter':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getAgentDescription = (type: string) => {
    switch (type) {
      case 'orchestrator':
        return 'Manages simulation flow and coordinates all agents'
      case 'planner':
        return 'Creates and manages execution plans'
      case 'evaluator':
        return 'Assesses simulation outcomes and progress'
      case 'reporter':
        return 'Generates summaries and final reports'
      default:
        return 'Custom agent representing a specific stakeholder'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500">Please refresh the page to try again</p>
      </div>
    )
  }

  // Filter agents based on type and search query
  const filteredAgents = agents.filter((agent) => {
    const matchesType = typeFilter === 'all' || getAgentCategory(agent) === typeFilter
    const matchesSearch =
      searchQuery === '' ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.instruction && agent.instruction.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesType && matchesSearch
  })

  if (agents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No agents found for this run</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(value: 'all' | 'SYSTEM' | 'AGENT') => setTypeFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="SYSTEM">System</SelectItem>
            <SelectItem value="AGENT">Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAgents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No agents match the current filters</p>
          <Button
            onClick={() => {
              setTypeFilter('all')
              setSearchQuery('')
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => {
            const agentType = getAgentTypeFromName(agent.name)
            const agentTypeColor = getAgentTypeColor(agentType)
            const agentDescription = getAgentDescription(agentType)

            return (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-600" />
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </div>
                    <Badge className={agentTypeColor}>{agentType}</Badge>
                  </div>
                  <CardDescription className="text-sm">{agentDescription}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">Agent ID:</span>
                      <p className="font-mono text-xs text-gray-700 break-all">{agent.id}</p>
                    </div>

                    {agent.instruction && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Instructions:</span>
                        <p className="text-gray-700 text-xs mt-1 line-clamp-2">
                          {agent.instruction}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link
                          href={`/runs/${runId}/agents/${agent.id}`}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Manage
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link
                          href={`/runs/${runId}/agents/${agent.id}?tab=traces`}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Traces
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
