import { createFileRoute } from '@tanstack/react-router'
import { fetchTasks } from '~/server/tasks'
import { TaskBoard } from '~/components/TaskBoard'
import { Header } from '~/components/Header'

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

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} onCreateTask={() => { /* Plan 05 wires this */ }} />
      <main className="pt-2">
        <TaskBoard
          initialTasks={tasks}
          onEditTask={() => { /* Plan 05 wires this */ }}
        />
      </main>
    </div>
  )
}
