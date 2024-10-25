'use client'

import { useState } from 'react'

type InstructAgentModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (agentId: string, message: string) => void
  agents: { id: string; name: string }[]
}

const InstructAgentModal = ({ isOpen, onClose, onSubmit, agents }: InstructAgentModalProps) => {
  const [selectedAgent, setSelectedAgent] = useState('')
  const [message, setMessage] = useState('')

  const handleAgentChange = (e) => setSelectedAgent(e.target.value)
  const handleMessageChange = (e) => setMessage(e.target.value)

  const handleSubmit = () => {
    onSubmit(selectedAgent, message)
    onClose() // Close the modal after submission
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
      <div className="bg-background p-6 rounded-lg text-foreground w-1/2 h-[400px] max-h-[400px] flex flex-col relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground text-2xl focus:outline-none"
        >
          &times;
        </button>

        <h2 className="text-2xl mb-4">Instruct Agent</h2>

        {/* Scrollable content container */}
        <div className="flex-grow overflow-y-auto">
          <div className="mb-4">
            <label className="block mb-2">Select Agent</label>
            <select
              value={selectedAgent}
              onChange={handleAgentChange}
              className="w-full p-2 bg-gray-800"
            >
              <option value="">-- Select an Agent --</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Message</label>
            <textarea
              value={message}
              onChange={handleMessageChange}
              className="w-full p-2 bg-gray-800"
              rows="4"
            ></textarea>
          </div>
        </div>

        {/* Sticky buttons */}
        <div className="flex justify-between mt-4 sticky bottom-0 bg-background p-4">
          <button onClick={onClose} className="bg-red-500 p-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAgent || !message}
            className={`p-2 rounded ${
              selectedAgent && message
                ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                : 'bg-gray-500 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstructAgentModal
