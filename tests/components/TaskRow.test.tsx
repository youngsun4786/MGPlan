import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskRow } from '../../app/components/TaskRow'

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

describe('TaskRow component', () => {
  it('displays client name, phone, request type, and status badge', () => {
    render(<TaskRow task={mockTask} onStatusChange={vi.fn()} onEdit={vi.fn()} />)
    expect(screen.getByText('Kim Minjun')).toBeDefined()
    expect(screen.getByText('010-1234-5678')).toBeDefined()
    expect(screen.getByText('New Booking')).toBeDefined()
  })

  it('shows last updated by display_name (TASK-07)', () => {
    render(<TaskRow task={mockTask} onStatusChange={vi.fn()} onEdit={vi.fn()} />)
    expect(screen.getByText(/Updated by Kim/)).toBeDefined()
  })

  it('applies opacity-60 class for done tasks', () => {
    const doneTask = { ...mockTask, status: 'done' as const }
    const { container } = render(
      <TaskRow task={doneTask} onStatusChange={vi.fn()} onEdit={vi.fn()} />,
    )
    expect(container.firstElementChild?.className).toContain('opacity-40')
  })

  it('calls onEdit on row click', () => {
    const onEdit = vi.fn()
    render(<TaskRow task={mockTask} onStatusChange={vi.fn()} onEdit={onEdit} />)
    fireEvent.click(screen.getByText('Kim Minjun'))
    expect(onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('calls onStatusChange with next status on badge click', () => {
    const onStatusChange = vi.fn()
    render(<TaskRow task={mockTask} onStatusChange={onStatusChange} onEdit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Status: Open/i }))
    expect(onStatusChange).toHaveBeenCalledWith('1', 'in_progress')
  })

  it('stops propagation on badge click to prevent row click', () => {
    const onEdit = vi.fn()
    const onStatusChange = vi.fn()
    render(<TaskRow task={mockTask} onStatusChange={onStatusChange} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button', { name: /Status: Open/i }))
    // onEdit should NOT have been called since badge click stops propagation
    expect(onEdit).not.toHaveBeenCalled()
    expect(onStatusChange).toHaveBeenCalled()
  })
})
