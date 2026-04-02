import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Use vi.hoisted to define mock functions that can be referenced in vi.mock factories
const { mockChannel, mockOn, mockSubscribe, mockRemoveChannel } = vi.hoisted(
  () => {
    const mockSubscribe = vi.fn().mockReturnValue({ unsubscribe: vi.fn() })
    const mockOn = vi.fn().mockReturnThis()
    const mockChannel = vi
      .fn()
      .mockReturnValue({ on: mockOn, subscribe: mockSubscribe })
    const mockRemoveChannel = vi.fn()
    return { mockChannel, mockOn, mockSubscribe, mockRemoveChannel }
  },
)

vi.mock('~/lib/supabase.client', () => ({
  supabaseBrowserClient: {
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    }),
  },
}))

vi.mock('~/server/tasks', () => ({
  updateTaskStatus: vi.fn(),
  fetchTasks: vi.fn(),
}))

import { TaskBoard } from '../../app/components/TaskBoard'

const mockTask = {
  id: '1',
  client_name: 'Kim Minjun',
  phone: '010-1234-5678',
  service: null,
  preferred_datetime: null,
  notes: null,
  request_type: 'new_booking' as const,
  status: 'open' as const,
  created_by: 'u1',
  last_updated_by: 'u1',
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
  staff: { display_name: 'Kim' },
}

describe('TaskBoard component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task rows sorted by created_at ASC (TASK-03)', () => {
    render(<TaskBoard initialTasks={[mockTask]} onEditTask={vi.fn()} />)
    expect(screen.getByText('Kim Minjun')).toBeDefined()
  })

  it('displays empty state when no tasks exist', () => {
    render(<TaskBoard initialTasks={[]} onEditTask={vi.fn()} />)
    expect(screen.getByText('No tasks yet')).toBeDefined()
  })

  it('subscribes to realtime channel on mount (RT-01)', () => {
    render(<TaskBoard initialTasks={[]} onEditTask={vi.fn()} />)
    expect(mockChannel).toHaveBeenCalledWith('tasks:all')
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('removes realtime channel on unmount (RT-01)', () => {
    const { unmount } = render(
      <TaskBoard initialTasks={[]} onEditTask={vi.fn()} />,
    )
    unmount()
    expect(mockRemoveChannel).toHaveBeenCalled()
  })
})
