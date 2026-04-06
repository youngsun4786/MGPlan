import { cn } from '~/lib/utils'
import { TASK_STATUS_LABELS, type TaskStatus } from '~/lib/constants'

interface StatusBadgeProps {
  status: TaskStatus
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  open: 'bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25',
  in_progress: 'bg-primary/15 text-primary border-primary/20 hover:bg-primary/25',
  done: 'bg-muted text-muted-foreground border-border/50 hover:bg-muted/80',
}

const DOT_COLORS: Record<TaskStatus, string> = {
  open: 'bg-amber-400 animate-pulse-dot',
  in_progress: 'bg-primary',
  done: 'bg-muted-foreground/50',
}

export function StatusBadge({ status, onClick, disabled }: StatusBadgeProps) {
  const label = TASK_STATUS_LABELS[status]
  const styles = STATUS_STYLES[status]

  const baseClasses = cn(
    'min-h-[32px] min-w-[32px] inline-flex items-center justify-center gap-1.5',
    'rounded-lg px-2.5 py-1 text-xs font-medium border',
    'focus-visible:ring-2 focus-visible:ring-primary/50',
    'outline-none transition-all',
    styles,
    disabled && 'opacity-50 cursor-not-allowed',
  )

  const dot = (
    <span className={cn('inline-block h-1.5 w-1.5 rounded-full shrink-0', DOT_COLORS[status])} />
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
        {dot}
        {label}
      </button>
    )
  }

  return (
    <span className={baseClasses} aria-label={`Status: ${label}`}>
      {dot}
      {label}
    </span>
  )
}
