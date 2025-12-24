import { Task } from '@/types'

// Domain rule: a task is overdue if it has a dueDate strictly before today and is not completed
export function isOverdue(task: Task, today: Date = new Date()): boolean {
  const t = new Date(today)
  t.setHours(0, 0, 0, 0)
  if (!task.dueDate || task.completed) return false
  const d = new Date(task.dueDate)
  return d < t
}
