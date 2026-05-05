import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { useAtom, useAtomValue } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { designingAtom, userIdAtom } from '../../../store.ts'
import styles from './Editing.module.css'

export const Editing = ({ projectId }) => {
  const [designingMap, setDesigningMap] = useAtom(designingAtom)
  const designing = designingMap[projectId] ?? false
  const userId = useAtomValue(userIdAtom)

  const onClick = (e) => {
    e.stopPropagation()
    setDesigningMap((prev) => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  const resultProject = useLiveQuery(
    `
      SELECT pu.role
      FROM project_users pu
      WHERE pu.project_id = $1 AND pu.user_id = $2
    `,
    [projectId, userId],
  )
  const userRole = resultProject?.rows?.[0]?.role

  const userMayDesign = userRole === 'design' || userRole === 'own'

  if (!userMayDesign) return null

  return (
    <Tooltip
      content={
        designing ? 'Designing this project. Click to stop' : 'Start designing'
      }
    >
      <Button
        size="small"
        icon={
          designing ? (
            <MdEditOff className={styles.svg} />
          ) : (
            <MdEdit className={styles.svg} />
          )
        }
        onClick={onClick}
        className={styles.button}
        appearance={designing ? 'primary' : 'secondary'}
      />
    </Tooltip>
  )
}
