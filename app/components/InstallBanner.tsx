import { X, Download } from 'lucide-react'

interface InstallBannerProps {
  onInstall: () => void
  onDismiss: () => void
  isIOS: boolean
}

export function InstallBanner({ onInstall, onDismiss, isIOS }: InstallBannerProps) {
  return (
    <div
      role="region"
      aria-label="App installation"
      className="glass-card rounded-xl p-4 max-w-[960px] mx-auto w-full"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
            <Download className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm text-foreground">Install Maison for quick access</p>
            {isIOS && (
              <ol className="mt-1.5 text-xs text-muted-foreground list-decimal list-inside space-y-0.5">
                <li>Tap the Share button</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
              </ol>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && (
            <button
              type="button"
              onClick={onInstall}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg min-h-[36px] text-sm transition-all glow-accent"
            >
              Install
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss install prompt"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
