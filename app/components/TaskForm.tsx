import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema, type CreateTaskInput } from '~/lib/schemas'
import { createTask, updateTask } from '~/server/tasks'
import { REQUEST_TYPE_LABELS, type RequestType } from '~/lib/constants'
import type { TaskWithStaff } from '~/components/TaskRow'
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
}

const emptyDefaults: CreateTaskInput = {
  client_name: '',
  phone: '',
  service: '',
  preferred_datetime: null,
  notes: '',
  request_type: undefined as unknown as CreateTaskInput['request_type'],
}

function getDefaults(task?: TaskWithStaff): CreateTaskInput {
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
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<CreateTaskInput>({
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
      } else {
        reset({ ...emptyDefaults })
      }
    }
  }, [open, task, mode, reset])

  async function onSubmit(data: CreateTaskInput) {
    if (mode === 'create') {
      await createTask({ data })
    } else {
      await updateTask({ data: { id: task!.id, ...data } })
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Task' : 'Edit Task'}
          </DialogTitle>
        </DialogHeader>

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
              aria-describedby={
                errors.client_name ? 'client_name-error' : undefined
              }
            />
            {errors.client_name && (
              <p
                id="client_name-error"
                className="text-red-600 text-sm mt-1"
                role="alert"
              >
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
              <p
                id="phone-error"
                className="text-red-600 text-sm mt-1"
                role="alert"
              >
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
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="request_type"
                    className="w-full"
                    aria-describedby={
                      errors.request_type ? 'request_type-error' : undefined
                    }
                  >
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(REQUEST_TYPE_LABELS) as [
                        RequestType,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.request_type && (
              <p
                id="request_type-error"
                className="text-red-600 text-sm mt-1"
                role="alert"
              >
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
  )
}
