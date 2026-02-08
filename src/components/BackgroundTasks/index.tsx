import { useState, useEffect } from 'react'
import { backgroundTasks } from '../../modules/backgroundTasks.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import styles from './BackgroundTasks.module.css'

export const BackgroundTasks = () => {
  const [tasks, setTasks] = useState(() => backgroundTasks.getAll())

  useEffect(() => {
    const unsubscribe = backgroundTasks.subscribe(() => {
      setTasks(backgroundTasks.getAll())
    })
    return unsubscribe
  }, [])

  if (tasks.length === 0) return null

  return (
    <div className={styles.container}>
      {tasks.map((task) => (
        <div key={task.id} className={styles.task}>
          <div className={styles.taskHeader}>
            <span className={styles.taskName}>{task.name}</span>
            <span className={styles.taskProgress}>
              {task.status === 'completed' ? (
                '✓ Complete'
              ) : task.status === 'error' ? (
                '✗ Error'
              ) : (
                `${formatNumber(task.progress)} / ${formatNumber(task.total)}`
              )}
            </span>
          </div>
          {task.status === 'running' && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(task.progress / task.total) * 100}%` }}
              />
            </div>
          )}
          {task.status === 'error' && task.error && (
            <div className={styles.error}>{task.error}</div>
          )}
        </div>
      ))}
    </div>
  )
}
