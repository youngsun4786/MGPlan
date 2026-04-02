export const TASK_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

export const REQUEST_TYPE = {
  NEW_BOOKING: 'new_booking',
  CHANGE_TIME: 'change_time',
  CHANGE_THERAPIST: 'change_therapist',
  OTHER: 'other',
} as const
export type RequestType = (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE]

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  new_booking: 'New Booking',
  change_time: 'Change Time',
  change_therapist: 'Change Therapist',
  other: 'Other',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  done: 'Done',
}
