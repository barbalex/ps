import { MdEdit, MdEditOff } from 'react-icons/md'
import { Button, Tooltip } from '@fluentui/react-components'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useCorbado } from '@corbado/react'

import { designingAtom } from '../../../store.ts'
import styles from './Editing.module.css'

export const Editing = ({ projectId }) => {
  const [designing, setDesigning] = useAtom(designingAtom)
  const { user } = useCorbado()

  const onClick = (e) => {
    e.stopPropagation()
    setDesigning(!designing)
  }

  // TODO: check if this works as intended (also: project.DesigningButton.tsx)
  const resultProject = useLiveQuery(
    `
      SELECT
        p.project_id,
        pu.role as project_user_role,
        u.email as account_user_email
      FROM projects p 
        inner join accounts a on p.account_id = a.account_id 
          inner join users u on u.user_id = a.user_id AND u.email = $2
        inner join project_users pu on pu.project_id = p.project_id
      WHERE 
        p.project_id = $1
    `,
    [projectId, user?.email],
  )
  const project = resultProject?.rows?.[0]
  const userIsOwner = project?.account_user_email === user?.email
  const userRole = project?.project_user_role
  // console.log('Tree.Project.Editing', {
  //   project,
  //   userRole,
  //   userIsOwner,
  //   resultProject,
  //   project_id: projectId,
  //   user,
  // })

  const userMayDesign = userIsOwner || userRole === 'manager'

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
            <MdEdit className={styles.svg} />
          ) : (
            <MdEditOff className={styles.svg} />
          )
        }
        onClick={onClick}
        className={styles.button}
      />
    </Tooltip>
  )
}
