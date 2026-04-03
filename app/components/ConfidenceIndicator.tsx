import { AlertTriangle } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

interface ConfidenceIndicatorProps {
  isLow: boolean
  children: React.ReactNode
  fieldName: string
}

export function ConfidenceIndicator({
  isLow,
  children,
  fieldName,
}: ConfidenceIndicatorProps) {
  if (!isLow) {
    return <>{children}</>
  }

  const warningId = `confidence-warning-${fieldName}`

  return (
    <div className="relative">
      <div
        className={cn(
          'confidence-low',
          '[&_input]:border-amber-400 [&_select]:border-amber-400 [&_textarea]:border-amber-400',
          '[&_[data-slot=select-trigger]]:border-amber-400'
        )}
      >
        {children}
      </div>
      <div className="absolute top-0 right-0 flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="inline-flex items-center"
              aria-describedby={warningId}
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </TooltipTrigger>
            <TooltipContent>
              AI extracted this -- please verify
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <span id={warningId} className="sr-only">
        AI extracted this -- please verify
      </span>
    </div>
  )
}
