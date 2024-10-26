'use client'

import { cn } from '@/lib/utils'
import { Agent } from '@/schemas'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'

type InstructAgentModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (agentId: number, message: string) => void
  agents: Agent[]
}

const InstructAgentModal = ({ isOpen, onClose, onSubmit, agents }: InstructAgentModalProps) => {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null) // Store agent ID (number)

  const [message, setMessage] = useState('')
  const [openAgentSelector, setOpenAgentSelector] = React.useState(false)
  const [agentId, setAgentId] = React.useState<string | null>(null)

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(e.target.value)

  const handleSubmit = () => {
    if (selectedAgent !== null) {
      onSubmit(selectedAgent, message)
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedAgent(null)
      setMessage('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
      <div className="bg-black p-6 rounded-lg text-white w-1/2 h-[400px] max-h-[400px] flex flex-col relative border border-gray-600 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl focus:outline-none hover:text-gray-200"
        >
          &times;
        </button>

        <h2 className="text-xl mb-4 text-white">Instruct Agent</h2>

        {/* Scrollable content */}
        <div className="flex-grow overflow-y-auto">
          <div className="mb-4">
            <Popover open={openAgentSelector} onOpenChange={setOpenAgentSelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAgentSelector}
                  className="w-[200px] justify-between"
                >
                  {selectedAgent !== null
                    ? agents.find((agent) => agent.id === selectedAgent)?.name
                    : 'Select agent...'}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search agent..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No agent found.</CommandEmpty>
                    <CommandGroup>
                      {agents.map((agent) => (
                        <CommandItem
                          key={agent.id}
                          onSelect={() => {
                            setSelectedAgent(agent.id) // Store agent.id (number)
                            setOpenAgentSelector(false)
                          }}
                        >
                          {agent.name} {/* Display agent.name */}
                          <CheckIcon
                            className={cn(
                              'ml-auto h-4 w-4',
                              selectedAgent === agent.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mb-4 mt-8">
            <Textarea
              value={message}
              onChange={handleMessageChange}
              className="bg-black w-full p-2 text-white rounded"
              rows={6}
              placeholder="Type your instruction here..."
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <Button variant="ghost" onClick={onClose} className="hover:bg-gray-600">
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={selectedAgent === null || !message}
            className={cn(
              selectedAgent === null || !message
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            )}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InstructAgentModal
