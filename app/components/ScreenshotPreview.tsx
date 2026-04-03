import { useState } from 'react'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '~/components/ui/collapsible'
import { Button } from '~/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '~/lib/utils'

interface ScreenshotPreviewProps {
  imageUrl: string
  defaultOpen?: boolean
}

export function ScreenshotPreview({
  imageUrl,
  defaultOpen = false,
}: ScreenshotPreviewProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible defaultOpen={defaultOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        render={<Button variant="ghost" className="w-full justify-between" />}
      >
        <span>{isOpen ? 'Hide Screenshot' : 'View Screenshot'}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <img
          src={imageUrl}
          alt="Uploaded screenshot"
          className="w-full rounded-lg object-contain max-h-[300px] mt-2"
        />
      </CollapsibleContent>
    </Collapsible>
  )
}
