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
  open: { active: 'bg-blue-100 text-blue-700 border-blue-300', inactive: 'bg-white text-slate-600 border-slate-200' },
  in_progress: { active: 'bg-amber-100 text-amber-700 border-amber-300', inactive: 'bg-white text-slate-600 border-slate-200' },
  done: { active: 'bg-green-100 text-green-700 border-green-300', inactive: 'bg-white text-slate-600 border-slate-200' },
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
    <div
      className={cn('sticky', BELOW_HEADER_TOP_CLASS, 'z-[5] bg-white/95 backdrop-blur-sm border-b border-slate-200')}
    >
      <div className="max-w-[960px] mx-auto px-4 py-3 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            aria-label="Search by client name or phone"
            className="w-full text-base pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
          />
        </div>

        {/* Status chips */}
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
                    'hover:shadow-sm',
                  )}
                  aria-pressed={isActive}
                  onClick={() => toggleStatus(status)}
                >
                  {TASK_STATUS_LABELS[status]}
                </button>
              )
            })}
          </div>

          <div className="h-5 w-px bg-slate-200" />

          {/* Sort + Clear */}
          <button
            type="button"
            onClick={toggleSort}
            aria-label={sortLabel}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{sortLabel}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
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
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
                  )}
                  aria-pressed={isActive}
                  onClick={() => toggleRequestType(type)}
                >
                  {REQUEST_TYPE_LABELS[type]}
                </button>
              )
            })}
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <label className="flex items-center gap-1">
              From
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => setDateFrom(e.target.value || null)}
                aria-label="Filter from date"
                className="text-base px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-700 text-xs"
              />
            </label>
            <label className="flex items-center gap-1">
              To
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => setDateTo(e.target.value || null)}
                aria-label="Filter to date"
                className="text-base px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-700 text-xs"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
