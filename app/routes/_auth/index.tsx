import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { fetchTasks, deleteTask as deleteTaskFn } from '~/server/tasks'
import { TaskBoard } from '~/components/TaskBoard'
import { Header } from '~/components/Header'
import { TaskForm } from '~/components/TaskForm'
import { DeleteTaskDialog } from '~/components/DeleteTaskDialog'
import type { TaskWithStaff } from '~/components/TaskRow'

export const Route = createFileRoute('/_auth/')({
  loader: async () => {
    const tasks = await fetchTasks()
    return { tasks }
  },
  component: BoardPage,
})

function BoardPage() {
  const { tasks } = Route.useLoaderData()
  const { user } = Route.useRouteContext()

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingTask, setEditingTask] = useState<TaskWithStaff | undefined>(
    undefined,
  )

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function handleCreateTask() {
    setFormMode('create')
    setEditingTask(undefined)
    setFormOpen(true)
  }

  function handleEditTask(task: TaskWithStaff) {
    setFormMode('edit')
    setEditingTask(task)
    setFormOpen(true)
  }

  function handleDeleteRequest(taskId: string) {
    setDeletingTaskId(taskId)
    setFormOpen(false)
    setDeleteOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!deletingTaskId) return
    setIsDeleting(true)
    try {
      await deleteTaskFn({ data: { id: deletingTaskId } })
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
      setDeletingTaskId(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} onCreateTask={handleCreateTask} />
      <main className="pt-2">
        <TaskBoard initialTasks={tasks} onEditTask={handleEditTask} />
      </main>
      <TaskForm
        mode={formMode}
        task={editingTask}
        open={formOpen}
        onOpenChange={setFormOpen}
        onDelete={handleDeleteRequest}
      />
      <DeleteTaskDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
