'use client'

import { Button } from '@/components/ui/button'

type ConfirmAbortModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

const ConfirmAbortModal = ({ isOpen, onClose, onConfirm }: ConfirmAbortModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
      <div className="bg-black p-6 rounded-lg text-white w-1/3 flex flex-col items-center flex flex-col relative border border-gray-600 shadow-lg">
        <h2 className="text-xl mb-4 text-white">Are you sure?</h2>
        <p className="mb-4">
          Do you really want to abort this simulation? This action cannot be undone.
        </p>
        <div className="flex space-x-4">
          <Button variant="default" onClick={onConfirm}>
            Yes, Abort
          </Button>
          <Button variant="ghost" onClick={onClose} className="hover:bg-gray-600">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmAbortModal
