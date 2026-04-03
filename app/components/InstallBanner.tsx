import { X } from 'lucide-react'

interface InstallBannerProps {
  onInstall: () => void
  onDismiss: () => void
  isIOS: boolean
}

export function InstallBanner({
  onInstall,
  onDismiss,
  isIOS,
}: InstallBannerProps) {
  return (
    <div
      role="region"
      aria-label="App installation"
      className="bg-secondary rounded-lg border border-border p-4 max-w-[960px] mx-auto w-full"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-base text-foreground">
            Install Maison for quick access
          </p>
          {isIOS && (
            <ol className="mt-2 text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Tap the Share button</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
            </ol>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && (
            <button
              type="button"
              onClick={onInstall}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md min-h-[44px] text-sm"
            >
              Install
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss install prompt"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
