import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock server functions before importing component
vi.mock('~/server/tasks', () => ({
  createTask: vi.fn().mockResolvedValue({ id: '1' }),
  updateTask: vi.fn().mockResolvedValue({ id: '1' }),
}))

// Mock the Dialog portal to render inline for testing
vi.mock('~/components/ui/dialog', async () => {
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

// Mock ScreenshotPreview
vi.mock('~/components/ScreenshotPreview', () => ({
  ScreenshotPreview: ({ imageUrl }: { imageUrl: string; defaultOpen?: boolean }) => (
    <div data-testid="screenshot-preview" data-url={imageUrl}>Screenshot Preview</div>
  ),
}))

import { TaskForm } from '../../app/components/TaskForm'
import type { ExtractionResult } from '../../app/lib/extraction-types'

// Mock extraction data with mixed confidence scores
const mockExtraction: ExtractionResult = {
  client_name: 'Kim Minjoo',
  phone: '010-1234-5678',
  service: 'Thai massage',
  preferred_datetime: '2026-04-05T14:00',
  notes: 'First time customer',
  request_type: 'new_booking',
  confidence: {
    client_name: 0.95,       // high -- no indicator
    phone: 0.85,             // high -- no indicator
    service: 0.5,            // low -- amber indicator
    preferred_datetime: 0.3, // low -- amber indicator
    notes: 0.6,              // low -- amber indicator
    request_type: 0.9,       // high -- no indicator
  },
}

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
      screenshot_url: null,
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
      screenshot_url: null,
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

describe('TaskForm screenshot integration', () => {
  const defaultProps = {
    mode: 'create' as const,
    open: true,
    onOpenChange: vi.fn(),
  }

  it('renders skeleton fields when isExtracting is true', () => {
    render(<TaskForm {...defaultProps} isExtracting={true} />)

    // Skeleton fields should be present (they use Skeleton component which renders divs with animate-pulse)
    // Real form inputs should NOT be present
    expect(screen.queryByLabelText('Client Name')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Phone Number')).not.toBeInTheDocument()

    // But the skeleton labels should still be visible
    expect(screen.getByText('Client Name')).toBeInTheDocument()
    expect(screen.getByText('Phone Number')).toBeInTheDocument()
    expect(screen.getByText('Service Requested')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('renders pre-filled fields when extractedData is provided', async () => {
    render(
      <TaskForm
        {...defaultProps}
        extractedData={mockExtraction}
      />,
    )

    // Wait for the useEffect to fire and reset the form
    await waitFor(() => {
      const clientInput = screen.getByLabelText('Client Name', { exact: false }) as HTMLInputElement
      expect(clientInput.value).toBe('Kim Minjoo')
    })

    const phoneInput = screen.getByLabelText('Phone Number', { exact: false }) as HTMLInputElement
    expect(phoneInput.value).toBe('010-1234-5678')

    const serviceInput = screen.getByLabelText('Service Requested') as HTMLInputElement
    expect(serviceInput.value).toBe('Thai massage')
  })

  it('renders amber confidence indicators on low-confidence fields', () => {
    render(
      <TaskForm
        {...defaultProps}
        extractedData={mockExtraction}
      />,
    )

    // Low-confidence fields (service: 0.5, preferred_datetime: 0.3, notes: 0.6)
    // should have confidence-low class wrapper
    const confidenceLowElements = document.querySelectorAll('.confidence-low')
    // service, preferred_datetime, and notes are low confidence
    expect(confidenceLowElements.length).toBe(3)
  })

  it('does NOT render confidence indicators when extractedData is null (manual create)', () => {
    render(<TaskForm {...defaultProps} />)

    // No confidence indicators should be present
    const confidenceLowElements = document.querySelectorAll('.confidence-low')
    expect(confidenceLowElements.length).toBe(0)
  })

  it('shows Processing... and disables submit button when isExtracting is true', () => {
    render(<TaskForm {...defaultProps} isExtracting={true} />)

    const submitButton = screen.getByRole('button', { name: /Processing/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
