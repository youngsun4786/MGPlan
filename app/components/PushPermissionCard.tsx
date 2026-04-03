import { X } from 'lucide-react'

interface PushPermissionCardProps {
  onEnable: () => void
  onDismiss: () => void
}

export function PushPermissionCard({ onEnable, onDismiss }: PushPermissionCardProps) {
  return (
    <div
      role="region"
      aria-label="Push notification setup"
      className="bg-secondary rounded-lg border border-border p-4 flex items-center justify-between gap-4"
    >
      <p className="text-base text-foreground">Get notified when new tasks come in</p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEnable}
          className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] px-4 rounded-md font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
        >
          Enable
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification prompt"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
