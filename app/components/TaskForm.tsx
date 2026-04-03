import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema } from '~/lib/schemas'
import type { z } from 'zod'

// Use z.input for the form type (before Zod transforms/defaults are applied)
type TaskFormValues = z.input<typeof createTaskSchema>
import { createTask, updateTask } from '~/server/tasks'
import { uploadScreenshot } from '~/server/screenshot'
import { validateImageFile, prepareImage, ACCEPTED_EXTENSIONS } from '~/lib/image-utils'
import { REQUEST_TYPE_LABELS, type RequestType } from '~/lib/constants'
import type { TaskWithStaff } from '~/components/TaskRow'
import { ImageLightbox } from '~/components/ImageLightbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'

interface TaskFormProps {
  mode: 'create' | 'edit'
  task?: TaskWithStaff
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (taskId: string) => void
}

const emptyDefaults: TaskFormValues = {
  client_name: '',
  phone: '',
  service: '',
  preferred_datetime: null,
  notes: '',
  request_type: undefined as unknown as TaskFormValues['request_type'],
}

function getDefaults(task?: TaskWithStaff): TaskFormValues {
  if (!task) return { ...emptyDefaults }
  return {
    client_name: task.client_name,
    phone: task.phone,
    service: task.service ?? '',
    preferred_datetime: task.preferred_datetime,
    notes: task.notes ?? '',
    request_type: task.request_type,
  }
}

export function TaskForm({ mode, task, open, onOpenChange, onDelete }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: getDefaults(task),
  })

  // Image attachment state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form when dialog opens, task changes, or mode switches.
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && task) {
        reset(getDefaults(task))
        setImagePreviewUrl(task.screenshot_url ?? null)
      } else {
        reset({ ...emptyDefaults })
        setImagePreviewUrl(null)
      }
      setImageFile(null)
    }
  }, [open, task, mode, reset])

  function handleAttachImage() {
    fileInputRef.current?.click()
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setImageFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  function handleRemoveImage() {
    setImageFile(null)
    setImagePreviewUrl(null)
  }

  async function onSubmit(data: TaskFormValues) {
    let screenshotUrl: string | null = null

    // Upload new image if attached
    if (imageFile) {
      const { base64, mediaType } = await prepareImage(imageFile)
      const result = await uploadScreenshot({ data: { imageBase64: base64, mediaType } })
      if (result.success) {
        screenshotUrl = result.screenshotUrl
      } else {
        toast.error(result.error)
        return
      }
    } else if (mode === 'edit' && task?.screenshot_url && imagePreviewUrl) {
      // Keep existing screenshot when editing
      screenshotUrl = task.screenshot_url
    }

    if (mode === 'create') {
      await createTask({ data: { ...data, screenshot_url: screenshotUrl } })
    } else {
      await updateTask({ data: { id: task!.id, ...data, screenshot_url: screenshotUrl } })
    }
    reset()
    setImageFile(null)
    setImagePreviewUrl(null)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Create Task' : 'Edit Task'}</DialogTitle>
          </DialogHeader>

          {imagePreviewUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
              <button
                type="button"
                className="shrink-0 rounded overflow-hidden"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={imagePreviewUrl}
                  alt="Attached screenshot"
                  className="h-12 w-12 object-cover"
                />
              </button>
              <span className="text-sm text-slate-600 truncate flex-1">
                {imageFile?.name ?? 'Screenshot'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Client Name */}
            <div>
              <Label htmlFor="client_name">
                Client Name
                <span className="text-red-600 ml-1">*</span>
              </Label>
              <Input
                id="client_name"
                {...register('client_name')}
                aria-describedby={errors.client_name ? 'client_name-error' : undefined}
              />
              {errors.client_name && (
                <p id="client_name-error" className="text-red-600 text-sm mt-1" role="alert">
                  {errors.client_name.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone">
                Phone Number
                <span className="text-red-600 ml-1">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className="text-red-600 text-sm mt-1" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Service Requested */}
            <div>
              <Label htmlFor="service">Service Requested</Label>
              <Input id="service" {...register('service')} />
            </div>

            {/* Request Type */}
            <div>
              <Label htmlFor="request_type">
                Request Type
                <span className="text-red-600 ml-1">*</span>
              </Label>
              <Controller
                name="request_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="request_type"
                      className="w-full"
                      aria-describedby={errors.request_type ? 'request_type-error' : undefined}
                    >
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(REQUEST_TYPE_LABELS) as [RequestType, string][]).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.request_type && (
                <p id="request_type-error" className="text-red-600 text-sm mt-1" role="alert">
                  {errors.request_type.message}
                </p>
              )}
            </div>

            {/* Preferred Date/Time */}
            <div>
              <Label htmlFor="preferred_datetime">Preferred Date/Time</Label>
              <Input
                id="preferred_datetime"
                type="datetime-local"
                {...register('preferred_datetime')}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                {...register('notes')}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 min-h-[80px] resize-y"
              />
            </div>

            {/* Attach Image */}
            {!imagePreviewUrl && (
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-[44px]"
                onClick={handleAttachImage}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Attach Screenshot
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              capture="environment"
              className="hidden"
              onChange={handleFileSelected}
            />

            {/* Footer */}
            <DialogFooter className="flex-row justify-between">
              {mode === 'edit' && onDelete && task && (
                <Button
                  type="button"
                  variant="destructive"
                  className="min-h-[44px]"
                  onClick={() => onDelete(task.id)}
                >
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-[44px]"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? mode === 'create'
                      ? 'Creating...'
                      : 'Saving...'
                    : mode === 'create'
                      ? 'Create Task'
                      : 'Save Changes'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {imagePreviewUrl && (
        <ImageLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          imageUrl={imagePreviewUrl}
        />
      )}
    </>
  )
}
