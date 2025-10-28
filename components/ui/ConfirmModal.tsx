"use client"

import { useState } from "react"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false
}: ConfirmModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  const handleConfirm = () => {
    onConfirm()
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className={`bg-white w-full max-w-md rounded-1xl shadow-2xl ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-1xl ${isDestructive ? 'bg-[#4a5a3f]' : 'bg-[#4a5a3f]'} text-white`}>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">{message}</p>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-1xl font-medium transition-colors cursor-pointer ${
                isDestructive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-[#4a5a3f] hover:bg-[#3d4a34] text-white'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
