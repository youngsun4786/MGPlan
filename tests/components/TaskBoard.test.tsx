import { describe, it } from 'vitest'

describe('TaskBoard component', () => {
  it.todo('renders task rows sorted by created_at ASC (TASK-03)')
  it.todo('displays empty state when no tasks exist')
  it.todo('subscribes to realtime channel on mount (RT-01)')
  it.todo('removes realtime channel on unmount (RT-01)')
  it.todo('adds new task to list on INSERT event (RT-02)')
  it.todo('updates task in list on UPDATE event')
  it.todo('removes task from list on DELETE event')
})
