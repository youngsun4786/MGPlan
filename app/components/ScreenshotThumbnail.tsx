import { Image as ImageIcon } from 'lucide-react'

interface ScreenshotThumbnailProps {
  screenshotUrl: string
  onView: () => void
}

export function ScreenshotThumbnail({
  screenshotUrl: _screenshotUrl,
  onView,
}: ScreenshotThumbnailProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2"
      onClick={(e) => {
        e.stopPropagation()
        onView()
      }}
      aria-label="View attached screenshot"
    >
      <ImageIcon className="h-4 w-4 text-muted-foreground/50 hover:text-primary cursor-pointer transition-colors" />
    </button>
  )
}
