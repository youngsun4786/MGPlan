import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema } from '~/lib/schemas'
import type { z } from 'zod'

// Use z.input for the form type (before Zod transforms/defaults are applied)
type TaskFormValues = z.input<typeof createTaskSchema>
import { createTask, updateTask } from '~/server/tasks'
import { REQUEST_TYPE_LABELS, type RequestType } from '~/lib/constants'
import type { TaskWithStaff } from '~/components/TaskRow'
import type { ExtractionResult } from '~/lib/extraction-types'
import { isLowConfidence } from '~/lib/extraction-types'
import { ConfidenceIndicator } from '~/components/ConfidenceIndicator'
import { SkeletonFormField } from '~/components/SkeletonFormField'
import { ScreenshotPreview } from '~/components/ScreenshotPreview'
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

interface TaskFormProps {
  mode: 'create' | 'edit'
  task?: TaskWithStaff
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (taskId: string) => void
  // Phase 3: AI screenshot support
  extractedData?: ExtractionResult | null
  screenshotUrl?: string | null
  isExtracting?: boolean
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

export function TaskForm({
  mode,
  task,
  open,
  onOpenChange,
  onDelete,
  extractedData,
  screenshotUrl,
  isExtracting,
}: TaskFormProps) {
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

  // REVIEW FIX: Reset form when dialog opens, task changes, or mode switches.
  // react-hook-form defaultValues are only read on initial mount, so we must
  // explicitly reset whenever the dialog context changes.
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && task) {
        reset(getDefaults(task))
      } else if (extractedData) {
        reset({
          client_name: extractedData.client_name ?? '',
          phone: extractedData.phone ?? '',
          service: extractedData.service ?? '',
          preferred_datetime: extractedData.preferred_datetime,
          notes: extractedData.notes ?? '',
          request_type: extractedData.request_type ?? undefined as unknown as TaskFormValues['request_type'],
        })
      } else {
        reset({ ...emptyDefaults })
      }
    }
  }, [open, task, mode, reset, extractedData])

  async function onSubmit(data: TaskFormValues) {
    if (mode === 'create') {
      await createTask({ data: { ...data, screenshot_url: screenshotUrl ?? null } })
    } else {
      await updateTask({ data: { id: task!.id, ...data } })
    }
    reset()
    onOpenChange(false)
  }

  const hasConfidence = !!extractedData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>

        {screenshotUrl && !isExtracting && (
          <ScreenshotPreview
            imageUrl={screenshotUrl}
            defaultOpen={typeof window !== 'undefined' && window.innerWidth >= 640}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Client Name */}
          {isExtracting ? (
            <SkeletonFormField label="Client Name" />
          ) : (
            <ConfidenceIndicator
              isLow={hasConfidence && isLowConfidence(extractedData!.confidence.client_name)}
              fieldName="client_name"
            >
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
            </ConfidenceIndicator>
          )}

          {/* Phone Number */}
          {isExtracting ? (
            <SkeletonFormField label="Phone Number" />
          ) : (
            <ConfidenceIndicator
              isLow={hasConfidence && isLowConfidence(extractedData!.confidence.phone)}
              fieldName="phone"
            >
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
            </ConfidenceIndicator>
          )}

          {/* Service Requested */}
          {isExtracting ? (
            <SkeletonFormField label="Service Requested" />
          ) : (
            <ConfidenceIndicator
              isLow={hasConfidence && isLowConfidence(extractedData!.confidence.service)}
              fieldName="service"
            >
              <div>
                <Label htmlFor="service">Service Requested</Label>
                <Input id="service" {...register('service')} />
              </div>
            </ConfidenceIndicator>
          )}

          {/* Request Type */}
          {isExtracting ? (
            <SkeletonFormField label="Request Type" />
          ) : (
            <ConfidenceIndicator
              isLow={hasConfidence && isLowConfidence(extractedData!.confidence.request_type)}
              fieldName="request_type"
            >
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
            </ConfidenceIndicator>
          )}

          {/* Preferred Date/Time */}
          {isExtracting ? (
            <SkeletonFormField label="Preferred Date/Time" />
          ) : (
            <ConfidenceIndicator
              isLow={hasConfidence && isLowConfidence(extractedData!.confidence.preferred_datetime)}
              fieldName="preferred_datetime"
            >
              <div>
                <Label htmlFor="preferred_datetime">Preferred Date/Time</Label>
                <Input
                  id="preferred_datetime"
                  type="datetime-local"
                  {...register('preferred_datetime')}
                />
              </div>
            </ConfidenceIndicator>
          )}

          {/* Notes */}
          {isExtracting ? (
            <SkeletonFormField label="Notes" isTextarea />
          ) : (
            <ConfidenceIndicator
              isLow={hasConfidence && isLowConfidence(extractedData!.confidence.notes)}
              fieldName="notes"
            >
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 min-h-[80px] resize-y"
                />
              </div>
            </ConfidenceIndicator>
          )}

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
                disabled={isSubmitting || isExtracting}
              >
                {isExtracting
                  ? 'Processing...'
                  : isSubmitting
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
  )
}
