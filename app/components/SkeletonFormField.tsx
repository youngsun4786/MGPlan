import { Skeleton } from '~/components/ui/skeleton'
import { Label } from '~/components/ui/label'

interface SkeletonFormFieldProps {
  label: string
  isTextarea?: boolean
}

export function SkeletonFormField({ label, isTextarea }: SkeletonFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Skeleton
        className={isTextarea ? 'h-20 w-full rounded-md' : 'h-10 w-full rounded-md'}
      />
    </div>
  )
}
