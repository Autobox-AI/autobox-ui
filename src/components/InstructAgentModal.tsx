'use client'

import { Agent } from '@/schemas'
import { SetStateAction, useState } from 'react'
import { Button } from './ui/button'

type InstructAgentModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (agentId: string, message: string) => void
  agents: Agent[]
}

const InstructAgentModal = ({ isOpen, onClose, onSubmit, agents }: InstructAgentModalProps) => {
  const [selectedAgent, setSelectedAgent] = useState('')
  const [message, setMessage] = useState('')

  const handleAgentChange = (e: { target: { value: SetStateAction<string> } }) =>
    setSelectedAgent(e.target.value)
  const handleMessageChange = (e: { target: { value: SetStateAction<string> } }) =>
    setMessage(e.target.value)

  const handleSubmit = () => {
    onSubmit(selectedAgent, message)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg text-gray-300 w-1/2 h-[400px] max-h-[400px] flex flex-col relative border border-gray-600 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 text-2xl focus:outline-none hover:text-gray-200"
        >
          &times;
        </button>

        <h2 className="text-xl mb-4 text-gray-100">Instruct Agent</h2>

        {/* Scrollable content */}
        <div className="flex-grow overflow-y-auto">
          <div className="mb-4">
            <label className="block mb-2 text-gray-400">Select Agent</label>
            <select
              value={selectedAgent}
              onChange={handleAgentChange}
              className="w-1/3 p-2 bg-gray-900 bg-opacity-75 text-white rounded"
            >
              <option value="">-- Select an Agent --</option>{' '}
              {/* Placeholder for no pre-selection */}
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-gray-400">Message</label>
            <textarea
              value={message}
              onChange={handleMessageChange}
              className="w-full p-2 bg-gray-900 bg-opacity-75 text-white rounded"
              rows={4}
            ></textarea>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <Button variant="ghost" onClick={onClose} className="hover:bg-gray-600">
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit} disabled={!selectedAgent || !message}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InstructAgentModal
