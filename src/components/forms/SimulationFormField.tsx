import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import React from 'react'

interface SimulationFormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  description?: string
}

export const SimulationFormField = ({
  label,
  error,
  required,
  children,
  description,
}: SimulationFormFieldProps) => (
  <div className="space-y-2">
    <Label className={cn(error && 'text-destructive')}>
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
    {children}
    {error && (
      <p className="text-sm text-destructive flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
)
