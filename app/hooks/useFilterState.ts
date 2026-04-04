import { useState, useCallback, useMemo } from 'react'
import type { TaskStatus, RequestType } from '~/lib/constants'
import { DEFAULT_FILTERS, type FilterState } from '~/lib/filters'

export function useFilterState() {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    statuses: new Set(DEFAULT_FILTERS.statuses),
    requestTypes: new Set(DEFAULT_FILTERS.requestTypes),
  }))

  const toggleStatus = useCallback((status: TaskStatus) => {
    setFilters((prev) => {
      const next = new Set(prev.statuses)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return { ...prev, statuses: next }
    })
  }, [])

  const toggleRequestType = useCallback((type: RequestType) => {
    setFilters((prev) => {
      const next = new Set(prev.requestTypes)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return { ...prev, requestTypes: next }
    })
  }, [])

  const setDateFrom = useCallback((date: string | null) => {
    setFilters((prev) => ({ ...prev, dateFrom: date }))
  }, [])

  const setDateTo = useCallback((date: string | null) => {
    setFilters((prev) => ({ ...prev, dateTo: date }))
  }, [])

  const setSearch = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, search: query }))
  }, [])

  const toggleSort = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const clearAll = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      statuses: new Set(),
      requestTypes: new Set(),
    })
  }, [])

  const hasActiveFilters = useMemo(
    () =>
      filters.statuses.size > 0 ||
      filters.requestTypes.size > 0 ||
      filters.dateFrom !== null ||
      filters.dateTo !== null ||
      filters.search !== '',
    [filters],
  )

  return {
    filters,
    toggleStatus,
    toggleRequestType,
    setDateFrom,
    setDateTo,
    setSearch,
    toggleSort,
    clearAll,
    hasActiveFilters,
  }
}
