import { useState, useCallback, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { fetchTasks, deleteTask as deleteTaskFn } from '~/server/tasks'
import { TaskBoard } from '~/components/TaskBoard'
import { Header } from '~/components/Header'
import { TaskForm } from '~/components/TaskForm'
import { DeleteTaskDialog } from '~/components/DeleteTaskDialog'
import { OfflineBanner } from '~/components/OfflineBanner'
import { OfflineShell } from '~/components/OfflineShell'
import { InstallBanner } from '~/components/InstallBanner'
import { PushPermissionCard } from '~/components/PushPermissionCard'
import { useOnlineStatus } from '~/hooks/useOnlineStatus'
import { useInstallPrompt } from '~/hooks/useInstallPrompt'
import { usePushSubscription } from '~/hooks/usePushSubscription'
import { useFilterState } from '~/hooks/useFilterState'
import { FilterBar } from '~/components/FilterBar'
import type { TaskWithStaff } from '~/components/TaskRow'
import { Toaster } from 'sonner'

const INSTALL_DISMISSED_KEY = 'maison-install-dismissed'

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

  const isOnline = useOnlineStatus()
  const { isStandalone, isIOS, promptInstall } = useInstallPrompt()
  const {
    permission: pushPermission,
    subscribe: pushSubscribe,
    dismiss: pushDismiss,
  } = usePushSubscription({ isStandalone, isIOS })

  const {
    filters,
    toggleStatus,
    toggleRequestType,
    setDateFrom,
    setDateTo,
    setSearch,
    toggleSort,
    clearAll,
    hasActiveFilters,
  } = useFilterState()

  const [installDismissed, setInstallDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(INSTALL_DISMISSED_KEY) === 'true') {
      setInstallDismissed(true)
    }
  }, [])

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingTask, setEditingTask] = useState<TaskWithStaff | undefined>(undefined)

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

  const handleInstallDismiss = useCallback(() => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true')
    setInstallDismissed(true)
  }, [])

  const handleInstallApp = useCallback(async () => {
    if (isIOS) {
      setInstallDismissed(false)
      localStorage.removeItem(INSTALL_DISMISSED_KEY)
    } else {
      await promptInstall()
    }
  }, [isIOS, promptInstall])

  const showInstallBanner = !isStandalone && !installDismissed
  const showPushCard = pushPermission === 'default' && !(isIOS && !isStandalone)

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <Header
        user={user}
        onCreateTask={handleCreateTask}
        isStandalone={isStandalone}
        installDismissed={installDismissed}
        onInstallApp={handleInstallApp}
        pushState={pushPermission}
        onEnableNotifications={pushSubscribe}
      />
      <OfflineBanner visible={!isOnline} />
      {!isOnline && !tasks ? (
        <OfflineShell />
      ) : (
        <>
          <main className="pt-2">
            <div className="px-4">
              {showPushCard && (
                <div className="mb-4 max-w-[960px] mx-auto w-full">
                  <PushPermissionCard onEnable={pushSubscribe} onDismiss={pushDismiss} />
                </div>
              )}
              {showInstallBanner && (
                <div className="mb-4 max-w-[960px] mx-auto w-full">
                  <InstallBanner
                    onInstall={handleInstallApp}
                    onDismiss={handleInstallDismiss}
                    isIOS={isIOS}
                  />
                </div>
              )}
            </div>
            <FilterBar
              filters={filters}
              toggleStatus={toggleStatus}
              toggleRequestType={toggleRequestType}
              setDateFrom={setDateFrom}
              setDateTo={setDateTo}
              setSearch={setSearch}
              toggleSort={toggleSort}
              clearAll={clearAll}
              hasActiveFilters={hasActiveFilters}
            />
            <TaskBoard
              initialTasks={tasks}
              onEditTask={handleEditTask}
              filters={filters}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAll}
            />
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
        </>
      )}
    </div>
  )
}
