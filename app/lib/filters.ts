import type { TaskWithStaff } from '~/components/TaskRow'
import type { TaskStatus, RequestType } from '~/lib/constants'

export interface FilterState {
  statuses: Set<TaskStatus>
  requestTypes: Set<RequestType>
  dateFrom: string | null
  dateTo: string | null
  search: string
  sortDirection: 'asc' | 'desc'
}

export const DEFAULT_FILTERS: FilterState = {
  statuses: new Set(),
  requestTypes: new Set(),
  dateFrom: null,
  dateTo: null,
  search: '',
  sortDirection: 'asc',
}

export function applyFilters(
  tasks: TaskWithStaff[],
  filters: FilterState,
): TaskWithStaff[] {
  let result = tasks

  // FILT-01: Status filter (empty = show all)
  if (filters.statuses.size > 0) {
    result = result.filter((t) => filters.statuses.has(t.status))
  }

  // FILT-02: Request type filter (empty = show all)
  if (filters.requestTypes.size > 0) {
    result = result.filter((t) => filters.requestTypes.has(t.request_type))
  }

  // FILT-03: Date range filter with UTC boundaries
  if (filters.dateFrom) {
    const fromUTC = filters.dateFrom + 'T00:00:00.000Z'
    result = result.filter((t) => t.created_at >= fromUTC)
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo + 'T00:00:00.000Z')
    toDate.setUTCDate(toDate.getUTCDate() + 1)
    const toUTC = toDate.toISOString()
    result = result.filter((t) => t.created_at < toUTC)
  }

  // FILT-04: Search filter (case-insensitive on client_name or phone)
  if (filters.search.trim()) {
    const query = filters.search.toLowerCase()
    result = result.filter(
      (t) =>
        t.client_name.toLowerCase().includes(query) ||
        t.phone.toLowerCase().includes(query),
    )
  }

  // Sort by created_at
  result = [...result].sort((a, b) => {
    const cmp = a.created_at.localeCompare(b.created_at)
    return filters.sortDirection === 'asc' ? cmp : -cmp
  })

  return result
}
