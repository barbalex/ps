import { MdEdit, MdEditOff } from 'react-icons/md'
import { ToggleButton, Tooltip } from '@fluentui/react-components'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useCorbado } from '@corbado/react'
import { useParams } from '@tanstack/react-router'

import { designingAtom } from '../../store.ts'

export const DesigningButton = ({ from }) => {
  const [designing, setDesigning] = useAtom(designingAtom)
  const { projectId } = useParams({ from })
  const { user } = useCorbado()

  const onClickDesigning = () => setDesigning(!designing)

  // TODO: check if this works as intended (also: Tree.Project.Editing.tsx)
  const resultProject = useLiveIncrementalQuery(
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
    'project_id',
  )
  const project = resultProject?.rows?.[0]
  const userIsOwner = project?.account_user_email === user?.email
  const userRole = project?.project_user_role
  // console.log('hello project DesignButton', { projectUser, userRole })

  const userMayDesign = userIsOwner || userRole === 'manager'

  if (!userMayDesign) return null

  return (
    <Tooltip
      content={
        designing ? 'Designing this project. Click to stop' : 'Start designing'
      }
    >
      <ToggleButton
        checked={designing}
        icon={designing ? <MdEdit /> : <MdEditOff />}
        onClick={onClickDesigning}
        className="designing-button"
      />
    </Tooltip>
  )
}
