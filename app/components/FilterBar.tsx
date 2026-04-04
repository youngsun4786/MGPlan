import { cn } from '~/lib/utils'
import { Search, ArrowUpDown, X } from 'lucide-react'
import { BELOW_HEADER_TOP_CLASS } from '~/lib/layout'
import {
  TASK_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  type TaskStatus,
  type RequestType,
} from '~/lib/constants'
import type { FilterState } from '~/lib/filters'

interface FilterBarProps {
  filters: FilterState
  toggleStatus: (status: TaskStatus) => void
  toggleRequestType: (type: RequestType) => void
  setDateFrom: (date: string | null) => void
  setDateTo: (date: string | null) => void
  setSearch: (query: string) => void
  toggleSort: () => void
  clearAll: () => void
  hasActiveFilters: boolean
}

const STATUS_COLORS: Record<TaskStatus, { active: string; inactive: string }> = {
  open: {
    active: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    inactive: 'bg-transparent text-muted-foreground border-border/50 hover:border-border',
  },
  in_progress: {
    active: 'bg-primary/20 text-primary border-primary/30',
    inactive: 'bg-transparent text-muted-foreground border-border/50 hover:border-border',
  },
  done: {
    active: 'bg-muted text-foreground border-border',
    inactive: 'bg-transparent text-muted-foreground border-border/50 hover:border-border',
  },
}

export function FilterBar({
  filters,
  toggleStatus,
  toggleRequestType,
  setDateFrom,
  setDateTo,
  setSearch,
  toggleSort,
  clearAll,
  hasActiveFilters,
}: FilterBarProps) {
  const sortLabel = filters.sortDirection === 'asc' ? 'Oldest first' : 'Newest first'

  return (
    <div className={cn('sticky', BELOW_HEADER_TOP_CLASS, 'z-[5] glass border-b border-border/30')}>
      <div className="max-w-[960px] mx-auto px-4 py-3 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            aria-label="Search by client name or phone"
            className="w-full text-base pl-9 pr-3 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
          />
        </div>

        {/* Status chips + sort + clear */}
        <div className="flex items-center gap-3">
          <div role="group" aria-label="Filter by status" className="flex items-center gap-2">
            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((status) => {
              const isActive = filters.statuses.has(status)
              const colors = STATUS_COLORS[status]
              return (
                <button
                  key={status}
                  type="button"
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                    isActive ? colors.active : colors.inactive,
                  )}
                  aria-pressed={isActive}
                  onClick={() => toggleStatus(status)}
                >
                  {TASK_STATUS_LABELS[status]}
                </button>
              )
            })}
          </div>

          <div className="h-5 w-px bg-border/30" />

          <button
            type="button"
            onClick={toggleSort}
            aria-label={sortLabel}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sortLabel}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Request type + Date range */}
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filter by request type" className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(REQUEST_TYPE_LABELS) as RequestType[]).map((type) => {
              const isActive = filters.requestTypes.has(type)
              return (
                <button
                  key={type}
                  type="button"
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                    isActive
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground/70 border-border/30 hover:border-border/60',
                  )}
                  aria-pressed={isActive}
                  onClick={() => toggleRequestType(type)}
                >
                  {REQUEST_TYPE_LABELS[type]}
                </button>
              )
            })}
          </div>

          <div className="h-4 w-px bg-border/30" />

          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <label className="flex items-center gap-1">
              From
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => setDateFrom(e.target.value || null)}
                aria-label="Filter from date"
                className="text-base px-2 py-1 rounded-md bg-secondary/30 border border-border/30 text-foreground text-xs"
              />
            </label>
            <label className="flex items-center gap-1">
              To
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => setDateTo(e.target.value || null)}
                aria-label="Filter to date"
                className="text-base px-2 py-1 rounded-md bg-secondary/30 border border-border/30 text-foreground text-xs"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
