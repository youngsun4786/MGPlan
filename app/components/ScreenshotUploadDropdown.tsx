import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { Plus, ChevronDown, Camera, PenLine } from 'lucide-react'

interface ScreenshotUploadDropdownProps {
  onUploadScreenshot: () => void
  onCreateManually: () => void
}

export function ScreenshotUploadDropdown({
  onUploadScreenshot,
  onCreateManually,
}: ScreenshotUploadDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px]" />}
      >
        <Plus className="h-4 w-4" />
        <ChevronDown className="h-3 w-3 ml-1" />
        <span className="hidden sm:inline">New Task</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuItem
          className="min-h-[44px] cursor-pointer"
          onClick={onUploadScreenshot}
        >
          <Camera className="h-4 w-4 mr-2" />
          Upload Screenshot
        </DropdownMenuItem>
        <DropdownMenuItem
          className="min-h-[44px] cursor-pointer"
          onClick={onCreateManually}
        >
          <PenLine className="h-4 w-4 mr-2" />
          Create Manually
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
