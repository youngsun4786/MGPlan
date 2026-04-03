import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

interface ImageLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
}

export function ImageLightbox({
  open,
  onOpenChange,
  imageUrl,
}: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[90vw] max-h-[90vh] p-2"
        aria-label="Screenshot preview"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Screenshot preview</DialogTitle>
        </DialogHeader>
        <img
          src={imageUrl}
          alt="Screenshot"
          className="w-full h-full object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
