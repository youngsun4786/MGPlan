import { X, Bell } from 'lucide-react'

interface PushPermissionCardProps {
  onEnable: () => void
  onDismiss: () => void
}

export function PushPermissionCard({ onEnable, onDismiss }: PushPermissionCardProps) {
  return (
    <div
      role="region"
      aria-label="Push notification setup"
      className="glass-card rounded-xl p-4 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm text-foreground">Get notified when new tasks come in</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEnable}
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[36px] px-4 rounded-lg text-sm font-medium transition-all glow-accent cursor-pointer"
        >
          Enable
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification prompt"
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
