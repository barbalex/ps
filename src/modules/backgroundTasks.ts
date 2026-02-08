/**
 * Background task manager for long-running operations
 * Allows tasks to continue even when user navigates away
 */

type TaskStatus = 'running' | 'completed' | 'error'

interface Task {
  id: string
  name: string
  status: TaskStatus
  progress: number
  total: number
  error?: string
}

const tasks = new Map<string, Task>()
const listeners = new Set<(tasks: Map<string, Task>) => void>()

export const backgroundTasks = {
  add(id: string, name: string, total: number) {
    tasks.set(id, {
      id,
      name,
      status: 'running',
      progress: 0,
      total,
    })
    notifyListeners()
  },

  updateProgress(id: string, progress: number) {
    const task = tasks.get(id)
    if (task) {
      task.progress = progress
      notifyListeners()
    }
  },

  complete(id: string) {
    const task = tasks.get(id)
    if (task) {
      task.status = 'completed'
      task.progress = task.total
      notifyListeners()
      // Auto-remove completed tasks after 3 seconds
      setTimeout(() => {
        tasks.delete(id)
        notifyListeners()
      }, 3000)
    }
  },

  error(id: string, error: string) {
    const task = tasks.get(id)
    if (task) {
      task.status = 'error'
      task.error = error
      notifyListeners()
      // Auto-remove error tasks after 10 seconds
      setTimeout(() => {
        tasks.delete(id)
        notifyListeners()
      }, 10000)
    }
  },

  remove(id: string) {
    tasks.delete(id)
    notifyListeners()
  },

  get(id: string): Task | undefined {
    return tasks.get(id)
  },

  getAll(): Task[] {
    return Array.from(tasks.values())
  },

  subscribe(callback: (tasks: Map<string, Task>) => void) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  },
}

function notifyListeners() {
  listeners.forEach((callback) => callback(tasks))
}
