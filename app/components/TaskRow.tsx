import { useState } from 'react'
import { cn } from '~/lib/utils'
import { formatRelativeTime } from '~/lib/utils'
import { REQUEST_TYPE_LABELS } from '~/lib/constants'
import type { TaskStatus } from '~/lib/constants'
import type { Task } from '~/lib/database.types'
import { StatusBadge } from '~/components/StatusBadge'
import { ScreenshotThumbnail } from '~/components/ScreenshotThumbnail'
import { ImageLightbox } from '~/components/ImageLightbox'

export type TaskWithStaff = Task & { staff?: { display_name: string } | null }

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  open: 'in_progress',
  in_progress: 'done',
  done: 'open',
}

interface TaskRowProps {
  task: TaskWithStaff
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onEdit: (task: TaskWithStaff) => void
}

export function TaskRow({ task, onStatusChange, onEdit }: TaskRowProps) {
  const isDone = task.status === 'done'
  const [lightboxOpen, setLightboxOpen] = useState(false)

  function handleBadgeClick(e: React.MouseEvent) {
    e.stopPropagation()
    onStatusChange(task.id, NEXT_STATUS[task.status])
  }

  const accentClass = `accent-${task.status}` as const

  return (
    <div
      className={cn(
        'glass-card card-elevated rounded-xl mb-2.5 relative',
        accentClass,
        isDone && 'opacity-40',
      )}
    >
      {/* Clickable overlay for the row — opens edit form */}
      <div
        role="button"
        tabIndex={0}
        className="absolute inset-0 rounded-xl cursor-pointer -z-0"
        onClick={() => onEdit(task)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onEdit(task)
          }
        }}
        aria-label={`Edit task for ${task.client_name}`}
      />

      <div className="relative z-[1] pointer-events-none pl-4 pr-4 py-3.5">
        {/* Top line: client name + screenshot thumbnail + status badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 truncate">
            <span className="text-[15px] font-semibold text-foreground truncate tracking-tight">
              {task.client_name}
            </span>
            {task.screenshot_url && (
              <span className="pointer-events-auto">
                <ScreenshotThumbnail
                  screenshotUrl={task.screenshot_url}
                  onView={() => setLightboxOpen(true)}
                />
              </span>
            )}
          </div>
          <span className="pointer-events-auto">
            <StatusBadge status={task.status} onClick={handleBadgeClick} />
          </span>
        </div>

        {/* Bottom line: phone + request type */}
        <div className="flex items-center gap-2.5 mt-2">
          <span className="text-sm text-muted-foreground tabular-nums">{task.phone}</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50 px-2 py-0.5 rounded-md bg-secondary/40">
            {REQUEST_TYPE_LABELS[task.request_type]}
          </span>
        </div>

        {/* Last updated info */}
        <div className="mt-1.5">
          <span className="text-xs text-muted-foreground/40">
            {task.staff?.display_name ?? 'Unknown'} · {formatRelativeTime(task.updated_at)}
          </span>
        </div>
      </div>

      {task.screenshot_url && (
        <ImageLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          imageUrl={task.screenshot_url}
        />
      )}
    </div>
  )
}
