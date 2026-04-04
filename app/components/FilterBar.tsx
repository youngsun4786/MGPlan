import { cn } from '~/lib/utils'
import { Search, ArrowUp, ArrowDown, X } from 'lucide-react'
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

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-[44px] px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
        active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      )}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  )
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
  const SortIcon = filters.sortDirection === 'asc' ? ArrowUp : ArrowDown
  const sortLabel = filters.sortDirection === 'asc' ? 'Sort: oldest first' : 'Sort: newest first'

  return (
    <div
      className={cn('sticky', BELOW_HEADER_TOP_CLASS, 'z-[5] bg-white border-b border-slate-200')}
    >
      <div className="max-w-[960px] mx-auto px-4 py-3 space-y-2">
        {/* Row 1: Search + Sort toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone..."
              aria-label="Search by client name or phone"
              className="w-full text-base pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={toggleSort}
            aria-label={sortLabel}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <SortIcon className="h-4 w-4" />
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="min-h-[44px] px-2 inline-flex items-center gap-1 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Row 2: Filter chips + date range */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* Status chips */}
          <div role="group" aria-label="Filter by status" className="flex items-center gap-2">
            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((status) => (
              <FilterChip
                key={status}
                label={TASK_STATUS_LABELS[status]}
                active={filters.statuses.has(status)}
                onClick={() => toggleStatus(status)}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200 flex-shrink-0" />

          {/* Request type chips */}
          <div role="group" aria-label="Filter by request type" className="flex items-center gap-2">
            {(Object.keys(REQUEST_TYPE_LABELS) as RequestType[]).map((type) => (
              <FilterChip
                key={type}
                label={REQUEST_TYPE_LABELS[type]}
                active={filters.requestTypes.has(type)}
                onClick={() => toggleRequestType(type)}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200 flex-shrink-0" />

          {/* Date range inputs */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <label className="text-xs text-slate-500">From</label>
            <input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(e) => setDateFrom(e.target.value || null)}
              aria-label="Filter from date"
              className="text-base text-sm px-2 py-1 rounded border border-slate-200 bg-white text-slate-700"
            />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <label className="text-xs text-slate-500">To</label>
            <input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(e) => setDateTo(e.target.value || null)}
              aria-label="Filter to date"
              className="text-base text-sm px-2 py-1 rounded border border-slate-200 bg-white text-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
