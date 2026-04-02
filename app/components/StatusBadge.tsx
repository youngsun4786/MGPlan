import { cn } from '~/lib/utils'
import { TASK_STATUS_LABELS, type TaskStatus } from '~/lib/constants'

interface StatusBadgeProps {
  status: TaskStatus
  onClick?: () => void
  disabled?: boolean
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  open: 'bg-amber-500 text-white hover:bg-amber-600',
  in_progress: 'bg-blue-600 text-white hover:bg-blue-700',
  done: 'bg-gray-500 text-white hover:bg-gray-600',
}

export function StatusBadge({ status, onClick, disabled }: StatusBadgeProps) {
  const label = TASK_STATUS_LABELS[status]
  const colors = STATUS_COLORS[status]

  const baseClasses = cn(
    'min-h-[44px] min-w-[44px] inline-flex items-center justify-center',
    'rounded-full px-3 py-1 text-sm font-medium',
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
    'outline-none transition-colors',
    colors,
    disabled && 'opacity-50 cursor-not-allowed',
  )

  if (onClick) {
    return (
      <button
        type="button"
        className={baseClasses}
        onClick={onClick}
        disabled={disabled}
        aria-label={`Status: ${label}, tap to change`}
      >
        {label}
      </button>
    )
  }

  return (
    <span className={baseClasses} aria-label={`Status: ${label}`}>
      {label}
    </span>
  )
}
