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

  function handleRowClick() {
    onEdit(task)
  }

  function handleRowKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onEdit(task)
    }
  }

  function handleBadgeClick(e: React.MouseEvent) {
    e.stopPropagation()
    onStatusChange(task.id, NEXT_STATUS[task.status])
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'glass-card rounded-xl px-4 py-3.5 mb-2 cursor-pointer transition-all hover:bg-secondary/40',
        isDone && 'opacity-40',
      )}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
    >
      {/* Top line: client name + screenshot thumbnail + status badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[15px] font-medium text-foreground truncate">{task.client_name}</span>
          {task.screenshot_url && (
            <ScreenshotThumbnail
              screenshotUrl={task.screenshot_url}
              onView={() => setLightboxOpen(true)}
            />
          )}
        </div>
        <StatusBadge status={task.status} onClick={handleBadgeClick} />
      </div>

      {/* Bottom line: phone + request type */}
      <div className="flex items-center gap-3 mt-1.5">
        <span className="text-sm text-muted-foreground">{task.phone}</span>
        <span className="text-xs text-muted-foreground/60 px-1.5 py-0.5 rounded bg-secondary/50">
          {REQUEST_TYPE_LABELS[task.request_type]}
        </span>
      </div>

      {/* Last updated info */}
      <div className="mt-1.5">
        <span className="text-xs text-muted-foreground/50">
          {task.staff?.display_name ?? 'Unknown'} · {formatRelativeTime(task.updated_at)}
        </span>
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
