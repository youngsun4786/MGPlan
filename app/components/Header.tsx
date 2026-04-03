import { ScreenshotUploadDropdown } from '~/components/ScreenshotUploadDropdown'
import { UserMenu } from '~/components/UserMenu'
import type { Staff } from '~/lib/database.types'

interface HeaderProps {
  user: Staff
  onUploadScreenshot: () => void
  onCreateManually: () => void
  isStandalone?: boolean
  installDismissed?: boolean
  onInstallApp?: () => void
  pushState?: 'granted' | 'denied' | 'default' | 'dismissed'
  onEnableNotifications?: () => void
}

export function Header({
  user,
  onUploadScreenshot,
  onCreateManually,
  isStandalone,
  installDismissed,
  onInstallApp,
  pushState,
  onEnableNotifications,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="h-14 flex items-center justify-between px-4 max-w-[960px] mx-auto w-full">
        <h1 className="text-xl font-semibold">Maison Task Board</h1>
        <div className="flex items-center gap-2">
          <ScreenshotUploadDropdown
            onUploadScreenshot={onUploadScreenshot}
            onCreateManually={onCreateManually}
          />
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
