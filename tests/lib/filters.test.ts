import { describe, it, expect } from 'vitest'
import type { TaskWithStaff } from '~/components/TaskRow'
import { applyFilters, DEFAULT_FILTERS, type FilterState } from '~/lib/filters'

// Helper to create mock tasks
function mockTask(overrides: Partial<TaskWithStaff> = {}): TaskWithStaff {
  return {
    id: crypto.randomUUID(),
    client_name: 'Test Client',
    phone: '010-1234-5678',
    service: null,
    preferred_datetime: null,
    notes: null,
    request_type: 'new_booking',
    status: 'open',
    created_by: 'user-1',
    last_updated_by: 'user-1',
    created_at: '2026-01-15T12:00:00.000Z',
    updated_at: '2026-01-15T12:00:00.000Z',
    screenshot_url: null,
    staff: null,
    ...overrides,
  }
}

describe('applyFilters', () => {
  const tasks: TaskWithStaff[] = [
    mockTask({ id: '1', client_name: 'Kim Minji', phone: '010-1111-2222', status: 'open', request_type: 'new_booking', created_at: '2026-01-10T08:00:00.000Z' }),
    mockTask({ id: '2', client_name: 'Park Soojin', phone: '010-3333-4444', status: 'in_progress', request_type: 'change_time', created_at: '2026-01-15T14:00:00.000Z' }),
    mockTask({ id: '3', client_name: 'Lee Hana', phone: '010-5555-6666', status: 'done', request_type: 'change_therapist', created_at: '2026-01-20T10:00:00.000Z' }),
    mockTask({ id: '4', client_name: 'Choi Yuna', phone: '010-7777-8888', status: 'open', request_type: 'other', created_at: '2026-01-25T16:00:00.000Z' }),
  ]

  describe('default filters (no constraints)', () => {
    it('returns all tasks when no filters are active', () => {
      const result = applyFilters(tasks, DEFAULT_FILTERS)
      expect(result).toHaveLength(4)
    })

    it('empty status Set returns all tasks (not zero)', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, statuses: new Set() }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(4)
    })

    it('empty requestTypes Set returns all tasks', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, requestTypes: new Set() }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(4)
    })
  })

  describe('FILT-01: status filter', () => {
    it('filters to only open tasks when status open is selected', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, statuses: new Set(['open'] as const) }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(2)
      expect(result.every(t => t.status === 'open')).toBe(true)
    })

    it('filters to multiple statuses', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, statuses: new Set(['open', 'in_progress'] as const) }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(3)
    })
  })

  describe('FILT-02: request type filter', () => {
    it('filters to only new_booking tasks', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, requestTypes: new Set(['new_booking'] as const) }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(1)
      expect(result[0].request_type).toBe('new_booking')
    })

    it('filters to multiple request types', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, requestTypes: new Set(['new_booking', 'other'] as const) }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(2)
    })
  })

  describe('FILT-03: date range filter', () => {
    it('excludes tasks before dateFrom', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, dateFrom: '2026-01-15' }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(3)
      expect(result.find(t => t.id === '1')).toBeUndefined() // Jan 10 excluded
    })

    it('excludes tasks after dateTo (inclusive of full day)', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, dateTo: '2026-01-15' }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(2) // Jan 10 and Jan 15
      expect(result.find(t => t.id === '3')).toBeUndefined() // Jan 20 excluded
      expect(result.find(t => t.id === '4')).toBeUndefined() // Jan 25 excluded
    })

    it('combines dateFrom and dateTo', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, dateFrom: '2026-01-12', dateTo: '2026-01-18' }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(1) // Only Jan 15
      expect(result[0].id).toBe('2')
    })

    // UTC boundary tests
    it('includes task at end of day UTC when dateTo matches that day', () => {
      const lateTask = mockTask({ id: 'late', created_at: '2026-01-15T23:59:59.000Z' })
      const filters: FilterState = { ...DEFAULT_FILTERS, dateTo: '2026-01-15' }
      const result = applyFilters([lateTask], filters)
      expect(result).toHaveLength(1)
    })

    it('excludes task just after midnight UTC when dateTo is previous day', () => {
      const nextDayTask = mockTask({ id: 'next', created_at: '2026-01-16T00:00:01.000Z' })
      const filters: FilterState = { ...DEFAULT_FILTERS, dateTo: '2026-01-15' }
      const result = applyFilters([nextDayTask], filters)
      expect(result).toHaveLength(0)
    })

    it('excludes task just before midnight UTC when dateFrom is next day', () => {
      const prevTask = mockTask({ id: 'prev', created_at: '2026-01-14T23:59:59.000Z' })
      const filters: FilterState = { ...DEFAULT_FILTERS, dateFrom: '2026-01-15' }
      const result = applyFilters([prevTask], filters)
      expect(result).toHaveLength(0)
    })

    it('includes task at exact start of dateFrom day UTC', () => {
      const exactTask = mockTask({ id: 'exact', created_at: '2026-01-15T00:00:00.000Z' })
      const filters: FilterState = { ...DEFAULT_FILTERS, dateFrom: '2026-01-15' }
      const result = applyFilters([exactTask], filters)
      expect(result).toHaveLength(1)
    })
  })

  describe('FILT-04: search filter', () => {
    it('matches client_name case-insensitively', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, search: 'kim' }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(1)
      expect(result[0].client_name).toBe('Kim Minji')
    })

    it('matches phone number substring', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, search: '3333' }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(1)
      expect(result[0].client_name).toBe('Park Soojin')
    })

    it('empty search returns all tasks', () => {
      const filters: FilterState = { ...DEFAULT_FILTERS, search: '' }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(4)
    })
  })

  describe('AND combination', () => {
    it('applies status AND search filters together', () => {
      const filters: FilterState = {
        ...DEFAULT_FILTERS,
        statuses: new Set(['open'] as const),
        search: 'kim',
      }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(1)
      expect(result[0].client_name).toBe('Kim Minji')
    })

    it('returns empty when AND filters exclude all', () => {
      const filters: FilterState = {
        ...DEFAULT_FILTERS,
        statuses: new Set(['done'] as const),
        search: 'kim', // Kim is 'open', not 'done'
      }
      const result = applyFilters(tasks, filters)
      expect(result).toHaveLength(0)
    })
  })

  describe('sort', () => {
    it('sorts ascending (oldest first) by default', () => {
      const result = applyFilters(tasks, { ...DEFAULT_FILTERS, sortDirection: 'asc' })
      expect(result[0].id).toBe('1') // Jan 10
      expect(result[3].id).toBe('4') // Jan 25
    })

    it('sorts descending (newest first)', () => {
      const result = applyFilters(tasks, { ...DEFAULT_FILTERS, sortDirection: 'desc' })
      expect(result[0].id).toBe('4') // Jan 25
      expect(result[3].id).toBe('1') // Jan 10
    })
  })
})
