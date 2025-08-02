import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SimulationFormData } from '@/schemas/simulationForm'
import { Trash2 } from 'lucide-react'
import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { SimulationFormField } from './SimulationFormField'

interface AgentFormCardProps {
  index: number
  register: UseFormRegister<SimulationFormData>
  errors: FieldErrors<SimulationFormData>
  onRemove: () => void
  canRemove: boolean
}

export const AgentFormCard = ({
  index,
  register,
  errors,
  onRemove,
  canRemove,
}: AgentFormCardProps) => (
  <Card className="p-4">
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Agent {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <SimulationFormField
        label="Agent Name"
        required
        error={errors.agents?.[index]?.name?.message as string | undefined}
        description="A unique identifier for this agent"
      >
        <Input {...register(`agents.${index}.name`)} placeholder="e.g., Environmental Advocate" />
      </SimulationFormField>

      <SimulationFormField
        label="Role"
        required
        error={errors.agents?.[index]?.role?.message as string | undefined}
        description="The agent's primary function in the simulation"
      >
        <Input
          {...register(`agents.${index}.role`)}
          placeholder="e.g., Climate scientist representing environmental organizations"
        />
      </SimulationFormField>

      <SimulationFormField
        label="Backstory"
        required
        error={errors.agents?.[index]?.backstory?.message as string | undefined}
        description="Background information that shapes the agent's perspective and behavior"
      >
        <Textarea
          {...register(`agents.${index}.backstory`)}
          placeholder="e.g., Dr. Sarah Chen is a renowned climate scientist with 20 years of experience..."
          rows={3}
        />
      </SimulationFormField>
    </div>
  </Card>
)
