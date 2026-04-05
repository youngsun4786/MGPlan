import { UserMenu } from '~/components/UserMenu'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
import type { Staff } from '~/lib/database.types'

interface HeaderProps {
  user: Staff
  onCreateTask: () => void
  isStandalone?: boolean
  installDismissed?: boolean
  onInstallApp?: () => void
  pushState?: 'granted' | 'denied' | 'default' | 'dismissed'
  onEnableNotifications?: () => void
}

export function Header({
  user,
  onCreateTask,
  isStandalone,
  installDismissed,
  onInstallApp,
  pushState,
  onEnableNotifications,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 glass border-b border-border/50">
      <div className="h-14 flex items-center justify-between px-4 max-w-[960px] mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <span className="text-gradient font-heading font-bold text-sm">M</span>
          </div>
          <h1 className="font-heading text-lg font-semibold tracking-tight">Maison</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[36px] rounded-xl px-3 gap-1.5 text-sm font-medium transition-all glow-accent"
            onClick={onCreateTask}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
          <UserMenu
            user={user}
            isStandalone={isStandalone}
            installDismissed={installDismissed}
            onInstallApp={onInstallApp}
            pushState={pushState}
            onEnableNotifications={onEnableNotifications}
          />
        </div>
      </div>
    </header>
  )
}
