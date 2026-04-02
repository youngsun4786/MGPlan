import { Plus } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { UserMenu } from '~/components/UserMenu'
import type { Staff } from '~/lib/database.types'

interface HeaderProps {
  user: Staff
  onCreateTask?: () => void
}

export function Header({ user, onCreateTask }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="h-14 flex items-center justify-between px-4 max-w-[960px] mx-auto w-full">
        <h1 className="text-xl font-semibold">Maison Task Board</h1>
        <div className="flex items-center gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px]"
            onClick={onCreateTask}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Task</span>
          </Button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
