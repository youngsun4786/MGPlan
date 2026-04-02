import { cn } from '~/lib/utils'
import { formatRelativeTime } from '~/lib/utils'
import { REQUEST_TYPE_LABELS } from '~/lib/constants'
import type { TaskStatus } from '~/lib/constants'
import type { Task } from '~/lib/database.types'
import { StatusBadge } from '~/components/StatusBadge'

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
        'px-4 py-4 border-b border-slate-200 hover:bg-slate-50 min-h-[44px] cursor-pointer transition-colors',
        isDone && 'opacity-60',
      )}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
    >
      {/* Top line: client name + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-normal text-slate-900 truncate">
          {task.client_name}
        </span>
        <StatusBadge
          status={task.status}
          onClick={handleBadgeClick}
        />
      </div>

      {/* Bottom line: phone + request type */}
      <div className="flex items-center gap-3 mt-1">
        <span className="text-sm text-slate-600">{task.phone}</span>
        <span className="text-sm text-slate-600">
          {REQUEST_TYPE_LABELS[task.request_type]}
        </span>
      </div>

      {/* Last updated info (TASK-07) */}
      <div className="mt-1">
        <span className="text-xs text-slate-400">
          Updated by {task.staff?.display_name ?? 'Unknown'}{' '}
          {formatRelativeTime(task.updated_at)}
        </span>
      </div>
    </div>
  )
}
