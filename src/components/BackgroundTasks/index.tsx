import { useState, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { Dismiss24Regular } from '@fluentui/react-icons'
import { useIntl } from 'react-intl'
import { backgroundTasks } from '../../modules/backgroundTasks.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import styles from './BackgroundTasks.module.css'

export const BackgroundTasks = () => {
  const [tasks, setTasks] = useState(() => backgroundTasks.getAll())
  const { formatMessage } = useIntl()

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
            <div className={styles.taskRight}>
              <span className={styles.taskProgress}>
                {task.status === 'completed' ? (
                  formatMessage({ id: 'bgTkCmp', defaultMessage: '✓ Abgeschlossen' })
                ) : task.status === 'error' ? (
                  formatMessage({ id: 'bgTkErr', defaultMessage: '✗ Fehler' })
                ) : (
                  `${formatNumber(task.progress)} / ${formatNumber(task.total)}`
                )}
              </span>
              <Button
                appearance="subtle"
                size="small"
                icon={<Dismiss24Regular />}
                onClick={() => backgroundTasks.remove(task.id)}
                className={styles.closeButton}
              />
            </div>
          </div>
          {task.status === 'running' && (
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${styles.progressFillSized}`}
                style={{
                  '--progress-width': `${(task.progress / task.total) * 100}%`,
                } as React.CSSProperties}
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
