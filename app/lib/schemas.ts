import { z } from 'zod'

// Create task schema -- validates the form input (TASK-01, TASK-08)
// .trim() on all string inputs prevents whitespace-only bypass of .min(1)
export const createTaskSchema = z.object({
  client_name: z.string().trim().min(1, 'Client name is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  service: z.string().trim().optional().default(''),
  preferred_datetime: z.string().nullable().optional().default(null),
  notes: z.string().trim().optional().default(''),
  request_type: z.enum(['new_booking', 'change_time', 'change_therapist', 'other'], {
    required_error: 'Request type is required',
  }),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

// Update task schema -- all fields optional except id (TASK-05)
export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  client_name: z.string().trim().min(1, 'Client name is required').optional(),
  phone: z.string().trim().min(1, 'Phone number is required').optional(),
  service: z.string().trim().optional(),
  preferred_datetime: z.string().nullable().optional(),
  notes: z.string().trim().optional(),
  request_type: z.enum(['new_booking', 'change_time', 'change_therapist', 'other']).optional(),
  status: z.enum(['open', 'in_progress', 'done']).optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// Status-only update -- for quick badge cycling (TASK-04)
export const updateTaskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['open', 'in_progress', 'done']),
})

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>

// Delete task -- just needs the ID (TASK-06)
export const deleteTaskSchema = z.object({
  id: z.string().uuid(),
})

export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>
