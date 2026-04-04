import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import { Moon, Sun } from 'lucide-react'
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
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('maison-theme')
    if (stored === 'light') {
      setIsDark(false)
      document.documentElement.classList.add('light')
    }
  }, [])

  function toggleTheme() {
    const apply = () => {
      const newDark = !isDark
      setIsDark(newDark)
      if (newDark) {
        document.documentElement.classList.remove('light')
        localStorage.setItem('maison-theme', 'dark')
      } else {
        document.documentElement.classList.add('light')
        localStorage.setItem('maison-theme', 'light')
      }
    }

    if (document.startViewTransition) {
      document.startViewTransition(apply)
    } else {
      apply()
    }
  }

  async function handleSignOut() {
    await supabaseBrowserClient.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="bg-secondary text-secondary-foreground rounded-full w-9 h-9 min-h-[36px] min-w-[36px] flex items-center justify-center font-semibold text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer hover:bg-secondary/80 transition-colors"
        aria-label="User menu"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[200px] glass-strong rounded-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col py-1">
              <span className="text-sm font-medium">{user.display_name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleTheme} className="gap-2 cursor-pointer">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </DropdownMenuItem>
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
                <DropdownMenuItem
                  className="text-muted-foreground cursor-pointer"
                  onClick={onEnableNotifications}
                >
                  Notifications off
                </DropdownMenuItem>
              )}
            </>
          )}
          {!isStandalone && installDismissed && onInstallApp && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onInstallApp} className="cursor-pointer">
                Install app
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
