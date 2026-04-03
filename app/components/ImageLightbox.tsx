import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'

interface ImageLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
}

export function ImageLightbox({ open, onOpenChange, imageUrl }: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[80vw] max-h-[80vh] overflow-y-auto p-2 bg-black/90 border-none ring-0"
        showCloseButton={false}
        aria-label="Screenshot preview"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Screenshot preview</DialogTitle>
        </DialogHeader>
        <img src={imageUrl} alt="Screenshot" className="w-full" />
      </DialogContent>
    </Dialog>
  )
}
