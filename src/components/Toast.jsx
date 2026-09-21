import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const colors = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColors = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
}

export default function Toast({ toasts, removeToast }) {
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const Icon = icons[toast.type] || icons.info
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-in-right ${colors[toast.type] || colors.info}`}
          >
            <Icon size={20} className={`flex-shrink-0 mt-0.5 ${iconColors[toast.type] || iconColors.info}`} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
