import { describe, it, expect } from 'vitest'
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  deleteTaskSchema,
} from '../../app/lib/schemas'

describe('createTask schema validation', () => {
  it('accepts valid input with all required fields (TASK-01)', () => {
    const result = createTaskSchema.safeParse({
      client_name: 'Kim Minjun',
      phone: '010-1234-5678',
      request_type: 'new_booking',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty client_name (TASK-08)', () => {
    const result = createTaskSchema.safeParse({
      client_name: '',
      phone: '010-1234-5678',
      request_type: 'new_booking',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Client name is required')
    }
  })

  it('rejects whitespace-only client_name (REVIEW FIX: .trim())', () => {
    const result = createTaskSchema.safeParse({
      client_name: '   ',
      phone: '010-1234-5678',
      request_type: 'new_booking',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty phone (TASK-08)', () => {
    const result = createTaskSchema.safeParse({
      client_name: 'Kim Minjun',
      phone: '',
      request_type: 'new_booking',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Phone number is required')
    }
  })

  it('rejects whitespace-only phone (REVIEW FIX: .trim())', () => {
    const result = createTaskSchema.safeParse({
      client_name: 'Kim Minjun',
      phone: '   ',
      request_type: 'new_booking',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid request_type values (TASK-02)', () => {
    const result = createTaskSchema.safeParse({
      client_name: 'Kim Minjun',
      phone: '010-1234-5678',
      request_type: 'invalid_type',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid request_type enum values (TASK-02)', () => {
    for (const rt of ['new_booking', 'change_time', 'change_therapist', 'other']) {
      const result = createTaskSchema.safeParse({
        client_name: 'Test',
        phone: '010-0000-0000',
        request_type: rt,
      })
      expect(result.success).toBe(true)
    }
  })
})

describe('updateTaskStatus schema validation', () => {
  it('accepts valid status transition (TASK-04)', () => {
    const result = updateTaskStatusSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'in_progress',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status values', () => {
    const result = updateTaskStatusSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID id', () => {
    const result = updateTaskStatusSchema.safeParse({
      id: 'not-a-uuid',
      status: 'done',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateTask schema validation', () => {
  it('accepts partial field updates (TASK-05)', () => {
    const result = updateTaskSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      client_name: 'Updated Name',
    })
    expect(result.success).toBe(true)
  })
})

describe('deleteTask schema validation', () => {
  it('accepts valid UUID for deletion (TASK-06)', () => {
    const result = deleteTaskSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-UUID id', () => {
    const result = deleteTaskSchema.safeParse({ id: 'abc' })
    expect(result.success).toBe(false)
  })
})
