import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Dialog = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div 
        className={cn(
          "relative w-full max-w-lg rounded-xl border border-white/5 bg-[#13131a] p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props} />
)

export const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)

export const DialogDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-gray-400", className)} {...props} />
)

export const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 border-t border-white/5 pt-4", className)} {...props} />
)
