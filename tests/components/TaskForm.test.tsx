import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock server functions before importing component
vi.mock('~/server/tasks', () => ({
  createTask: vi.fn().mockResolvedValue({ id: '1' }),
  updateTask: vi.fn().mockResolvedValue({ id: '1' }),
}))

// Mock the Dialog portal to render inline for testing
vi.mock('~/components/ui/dialog', async () => {
  const React = await import('react')
  return {
    Dialog: ({
      children,
      open,
    }: {
      children: React.ReactNode
      open: boolean
      onOpenChange?: (open: boolean) => void
    }) => (open ? <div data-testid="dialog">{children}</div> : null),
    DialogContent: ({
      children,
    }: {
      children: React.ReactNode
      className?: string
      showCloseButton?: boolean
    }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    DialogFooter: ({ children }: { children: React.ReactNode; className?: string }) => (
      <div>{children}</div>
    ),
  }
})

// Mock Select to render as native select for testing
vi.mock('~/components/ui/select', async () => {
  const React = await import('react')
  return {
    Select: ({
      children,
      value,
      onValueChange,
    }: {
      children: React.ReactNode
      value?: string
      onValueChange?: (value: string) => void
    }) => (
      <div data-value={value} data-onchange={onValueChange?.toString()}>
        {children}
      </div>
    ),
    SelectTrigger: ({ children, ...props }: Record<string, unknown>) => (
      <button type="button" {...props}>
        {children as React.ReactNode}
      </button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
      <option value={value}>{children}</option>
    ),
  }
})

import { TaskForm } from '../../app/components/TaskForm'

describe('TaskForm component', () => {
  const defaultProps = {
    mode: 'create' as const,
    open: true,
    onOpenChange: vi.fn(),
  }

  it('renders Create Task title in create mode', () => {
    render(<TaskForm {...defaultProps} />)
    // Title is in an h2, button also says "Create Task" so use getAllByText
    const elements = screen.getAllByText('Create Task')
    expect(elements.length).toBeGreaterThanOrEqual(1)
    // The h2 title should exist
    const heading = elements.find((el) => el.tagName === 'H2')
    expect(heading).toBeInTheDocument()
  })

  it('renders Edit Task title in edit mode', () => {
    const task = {
      id: '1',
      client_name: 'Kim',
      phone: '010-0000-0000',
      service: null,
      preferred_datetime: null,
      notes: null,
      request_type: 'new_booking' as const,
      status: 'open' as const,
      created_by: 'u1',
      last_updated_by: 'u1',
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z',
    }
    render(<TaskForm mode="edit" task={task} open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('Edit Task')).toBeInTheDocument()
  })

  it('shows validation error when client_name is empty (TASK-08)', async () => {
    render(<TaskForm {...defaultProps} />)
    const submitButton = screen.getByRole('button', { name: /Create Task/i })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Client name is required')).toBeInTheDocument()
    })
  })

  it('shows validation error when phone is empty (TASK-08)', async () => {
    render(<TaskForm {...defaultProps} />)
    const submitButton = screen.getByRole('button', { name: /Create Task/i })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Phone number is required')).toBeInTheDocument()
    })
  })

  it('renders all form fields with correct labels', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Client Name')).toBeInTheDocument()
    expect(screen.getByText('Phone Number')).toBeInTheDocument()
    expect(screen.getByText('Service Requested')).toBeInTheDocument()
    expect(screen.getByText('Request Type')).toBeInTheDocument()
    expect(screen.getByText('Preferred Date/Time')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(<TaskForm {...defaultProps} open={false} />)
    expect(screen.queryByText('Create Task')).not.toBeInTheDocument()
  })

  it('shows Delete button in edit mode with onDelete', () => {
    const task = {
      id: '1',
      client_name: 'Kim',
      phone: '010-0000-0000',
      service: null,
      preferred_datetime: null,
      notes: null,
      request_type: 'new_booking' as const,
      status: 'open' as const,
      created_by: 'u1',
      last_updated_by: 'u1',
      created_at: '2026-04-01T00:00:00Z',
      updated_at: '2026-04-01T00:00:00Z',
    }
    const onDelete = vi.fn()
    render(
      <TaskForm mode="edit" task={task} open={true} onOpenChange={vi.fn()} onDelete={onDelete} />,
    )
    const deleteButton = screen.getByRole('button', { name: /Delete/i })
    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
