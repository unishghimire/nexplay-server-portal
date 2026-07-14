import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
            error: <AlertCircle className="h-5 w-5 text-rose-500" />,
            warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
            info: <Info className="h-5 w-5 text-sky-500" />,
          }

          const borderColors = {
            success: 'border-emerald-500/20 bg-[#101c16]',
            error: 'border-rose-500/20 bg-[#1c1012]',
            warning: 'border-amber-500/20 bg-[#1c1710]',
            info: 'border-sky-500/20 bg-[#10181c]',
          }

          return (
            <div
              key={t.id}
              className={`flex items-center justify-between p-4 rounded-lg border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 pointer-events-auto ${borderColors[t.type]}`}
            >
              <div className="flex items-center gap-3">
                {icons[t.type]}
                <span className="text-sm font-medium text-white">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="ml-4 text-gray-400 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
