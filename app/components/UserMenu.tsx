import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import { supabaseBrowserClient } from '~/lib/supabase.client'

interface UserMenuProps {
  user: { display_name: string; email: string }
}

export function UserMenu({ user }: UserMenuProps) {
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
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.display_name}</span>
            <span className="text-xs text-slate-500">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
