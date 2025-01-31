import { useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { ToggleButton } from '@fluentui/react-components'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { designingAtom, userIdAtom } from '../../store.ts'

export const DesigningButton = memo(() => {
  const [designing, setDesigning] = useAtom(designingAtom)
  const [userId] = useAtom(userIdAtom)
  const { project_id } = useParams()

  const onClickDesigning = useCallback(
    () => setDesigning(!designing),
    [designing, setDesigning],
  )

  const resultProject = useLiveQuery(
    `
      SELECT
        a.user_id as account_user_id, 
        pu.role as project_user_role
      FROM projects p 
        inner join accounts a on p.account_id = a.account_id 
        inner join project_users pu on pu.project_id = p.project_id AND pu.user_id = $2 
      WHERE 
        project_id = $1
    `,
    [project_id, userId],
  )
  const project = resultProject?.rows?.[0]
  const userIsOwner = project?.account_user_id === user_id
  const userRole = project?.project_user_role
  // console.log('hello project DesignButton', { projectUser, userRole })

  const userMayDesign = userIsOwner || userRole === 'manager'

  if (!userMayDesign) return null

  return (
    <ToggleButton
      checked={designing}
      title={
        designing ? 'Designing this project. Click to stop' : 'Start designing'
      }
      icon={designing ? <MdEdit /> : <MdEditOff />}
      onClick={onClickDesigning}
      className="designing-button"
    />
  )
})
