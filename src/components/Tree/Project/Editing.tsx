import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { designingAtom } from '../../../store.ts'
import styles from './Editing.module.css'
import { useSession } from '../../../modules/authClient.ts'

export const Editing = ({ projectId }) => {
  const [designingMap, setDesigningMap] = useAtom(designingAtom)
  const designing = designingMap[projectId] ?? false
  const { data: session } = useSession()
  const user = session?.user

  const onClick = (e) => {
    e.stopPropagation()
    setDesigningMap((prev) => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  const resultProject = useLiveQuery(
    `
      SELECT pu.role
      FROM project_users pu
        INNER JOIN users u ON u.user_id = pu.user_id AND u.email = $2
      WHERE pu.project_id = $1
    `,
    [projectId, user?.email],
  )
  const userRole = resultProject?.rows?.[0]?.role

  const userMayDesign = userRole === 'designer' || userRole === 'owner'

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
