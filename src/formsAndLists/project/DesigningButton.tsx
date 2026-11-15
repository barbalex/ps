import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton, Tooltip } = fluentUiReactComponents
import { useAtomValue } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { useUrlDesigning } from '../../modules/useUrlDesigning.ts'
import { userIdAtom } from '../../store.ts'

export const DesigningButton = (_props: { from: string }) => {
  const { projectId } = useParams({ strict: false }) as { projectId: string }
  // url param wins, the designingAtom map is the fallback (see the hook)
  const [designing, setDesigning] = useUrlDesigning(projectId)
  const userId = useAtomValue(userIdAtom)

  const onClickDesigning = () => setDesigning(!designing)

  const resultProject = useLiveQuery(
    `
      SELECT pr.role
      FROM project_roles pr
      JOIN project_users pu ON pu.project_user_id = pr.project_user_id
      WHERE pr.project_id = $1
        AND (pu.auth_user_id = $2 OR pu.email = (SELECT email FROM users WHERE user_id = $2))
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
      relationship="label"
    >
      <ToggleButton
        checked={designing}
        icon={designing ? <MdEditOff /> : <MdEdit />}
        onClick={onClickDesigning}
      />
    </Tooltip>
  )
}
