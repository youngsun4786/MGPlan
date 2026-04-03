import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import { supabaseBrowserClient } from '~/lib/supabase.browser'

interface UserMenuProps {
  user: { display_name: string; email: string }
  isStandalone?: boolean
  installDismissed?: boolean
  onInstallApp?: () => void
  pushState?: 'granted' | 'denied' | 'default' | 'dismissed'
  onEnableNotifications?: () => void
}

export function UserMenu({
  user,
  isStandalone,
  installDismissed,
  onInstallApp,
  pushState,
  onEnableNotifications,
}: UserMenuProps) {
  const initial = user.display_name.charAt(0).toUpperCase()

  async function handleSignOut() {
    await supabaseBrowserClient.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="bg-slate-200 text-slate-700 rounded-full w-9 h-9 min-h-[44px] min-w-[44px] flex items-center justify-center font-semibold text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
        aria-label="User menu"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.display_name}</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
          </DropdownMenuLabel>
          {(pushState === 'denied' || pushState === 'dismissed') && (
            <>
              <DropdownMenuSeparator />
              {typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'denied' ? (
                <DropdownMenuItem
                  className="text-muted-foreground flex flex-col items-start"
                  onSelect={(e) => e.preventDefault()}
                >
                  <span>Notifications off</span>
                  <span className="text-muted-foreground text-xs">Enable in browser settings</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-muted-foreground" onClick={onEnableNotifications}>
                  Notifications off
                </DropdownMenuItem>
              )}
            </>
          )}
          {!isStandalone && installDismissed && onInstallApp && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onInstallApp}>Install app</DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
