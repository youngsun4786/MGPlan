import { createServerFn } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'
import { getWebRequest } from '@tanstack/react-start/server'
import { getSupabaseServerClient } from '~/lib/supabase.server'
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  deleteTaskSchema,
} from '~/lib/schemas'

// Fetch all tasks ordered by created_at ASC (D-02: FIFO queue)
export const fetchTasks = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest()
  const supabase = getSupabaseServerClient(request.headers)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('tasks')
    .select(
      'id, client_name, phone, service, preferred_datetime, notes, request_type, status, created_by, last_updated_by, created_at, updated_at, staff!tasks_last_updated_by_fkey(display_name)'
    )
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
})

// Create a new task (TASK-01)
export const createTask = createServerFn({ method: 'POST' })
  .validator(zodValidator(createTaskSchema))
  .handler(async ({ data }) => {
    const request = getWebRequest()
    const supabase = getSupabaseServerClient(request.headers)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        client_name: data.client_name,
        phone: data.phone,
        service: data.service || null,
        preferred_datetime: data.preferred_datetime || null,
        notes: data.notes || null,
        request_type: data.request_type,
        created_by: user.id,
        last_updated_by: user.id,
      })
      .select(
        'id, client_name, phone, service, preferred_datetime, notes, request_type, status, created_by, last_updated_by, created_at, updated_at'
      )
      .single()

    if (error) throw new Error(error.message)
    return task
  })

// Update task fields partially (TASK-05)
export const updateTask = createServerFn({ method: 'POST' })
  .validator(zodValidator(updateTaskSchema))
  .handler(async ({ data }) => {
    const request = getWebRequest()
    const supabase = getSupabaseServerClient(request.headers)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { id, ...updates } = data
    const { data: task, error } = await supabase
      .from('tasks')
      .update({ ...updates, last_updated_by: user.id })
      .eq('id', id)
      .select(
        'id, client_name, phone, service, preferred_datetime, notes, request_type, status, created_by, last_updated_by, created_at, updated_at'
      )
      .single()

    if (error) throw new Error(error.message)
    return task
  })

// Update task status only -- for quick badge cycling (TASK-04)
export const updateTaskStatus = createServerFn({ method: 'POST' })
  .validator(zodValidator(updateTaskStatusSchema))
  .handler(async ({ data }) => {
    const request = getWebRequest()
    const supabase = getSupabaseServerClient(request.headers)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: task, error } = await supabase
      .from('tasks')
      .update({ status: data.status, last_updated_by: user.id })
      .eq('id', data.id)
      .select('id, status, last_updated_by, updated_at')
      .single()

    if (error) throw new Error(error.message)
    return task
  })

// Delete a task by ID (TASK-06)
export const deleteTask = createServerFn({ method: 'POST' })
  .validator(zodValidator(deleteTaskSchema))
  .handler(async ({ data }) => {
    const request = getWebRequest()
    const supabase = getSupabaseServerClient(request.headers)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('tasks').delete().eq('id', data.id)

    if (error) throw new Error(error.message)
    return { success: true }
  })
