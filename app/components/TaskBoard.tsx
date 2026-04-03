import { useState, useEffect, useRef } from 'react'
import { supabaseBrowserClient } from '~/lib/supabase.browser'
import { fetchTasks, updateTaskStatus } from '~/server/tasks'
import type { Task } from '~/lib/database.types'
import type { TaskStatus } from '~/lib/constants'
import { TaskRow, type TaskWithStaff } from '~/components/TaskRow'

interface TaskBoardProps {
  initialTasks: TaskWithStaff[]
  onEditTask: (task: TaskWithStaff) => void
}

export function TaskBoard({ initialTasks, onEditTask }: TaskBoardProps) {
  const [tasks, setTasks] = useState<TaskWithStaff[]>(initialTasks)

  // Build a staff lookup cache from initial data and keep it updated
  // Realtime payloads only contain raw columns (no joined staff data),
  // so we resolve display_name from this cache to avoid N+1 fetches
  const staffMapRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    // Seed staffMap from initial tasks
    initialTasks.forEach((t) => {
      if (t.staff?.display_name && t.last_updated_by) {
        staffMapRef.current.set(t.last_updated_by, t.staff.display_name)
      }
    })
    setTasks(initialTasks)
  }, [initialTasks])

  // Helper to enrich a raw task payload with staff display_name from cache
  function enrichWithStaff(rawTask: Task): TaskWithStaff {
    const displayName = staffMapRef.current.get(rawTask.last_updated_by)
    return {
      ...rawTask,
      staff: displayName ? { display_name: displayName } : null,
    }
  }

  useEffect(() => {
    const channel = supabaseBrowserClient
      .channel('tasks:all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newTask = enrichWithStaff(payload.new as Task)
          // If staff not in cache, fetch it
          if (!newTask.staff) {
            const { data } = await supabaseBrowserClient
              .from('staff')
              .select('display_name')
              .eq('id', (payload.new as Task).last_updated_by)
              .single()
            if (data) {
              staffMapRef.current.set((payload.new as Task).last_updated_by, data.display_name)
              newTask.staff = { display_name: data.display_name }
            }
          }
          setTasks((prev) => [...prev, newTask])
        } else if (payload.eventType === 'UPDATE') {
          const updatedTask = enrichWithStaff(payload.new as Task)
          if (!updatedTask.staff) {
            const { data } = await supabaseBrowserClient
              .from('staff')
              .select('display_name')
              .eq('id', (payload.new as Task).last_updated_by)
              .single()
            if (data) {
              staffMapRef.current.set((payload.new as Task).last_updated_by, data.display_name)
              updatedTask.staff = { display_name: data.display_name }
            }
          }
          setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== (payload.old as { id: string }).id))
        }
      })
      .subscribe()

    return () => {
      supabaseBrowserClient.removeChannel(channel)
    }
  }, [])

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    // Optimistic: update local state immediately
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
    try {
      await updateTaskStatus({ data: { id: taskId, status: newStatus } })
    } catch {
      // Revert on error -- refetch all
      const fresh = await fetchTasks()
      setTasks(fresh as TaskWithStaff[])
    }
  }

  // Sort tasks by created_at ASC (D-02 FIFO)
  const sortedTasks = tasks
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  if (tasks.length === 0) {
    return (
      <div className="max-w-[960px] mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <h2 className="text-xl font-semibold text-slate-600">No tasks yet</h2>
          <p className="text-base text-slate-500 mt-2 text-center">
            Create your first task to start tracking client requests.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[960px] mx-auto w-full">
      {sortedTasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onStatusChange={handleStatusChange}
          onEdit={onEditTask}
        />
      ))}
    </div>
  )
}
