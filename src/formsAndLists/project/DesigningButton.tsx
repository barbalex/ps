import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton, Tooltip } = fluentUiReactComponents
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { designingAtom } from '../../store.ts'
import { useSession } from '../../modules/authClient.ts'

export const DesigningButton = ({ from }) => {
  const [designingMap, setDesigningMap] = useAtom(designingAtom)
  const { projectId } = useParams({ from })
  const designing = designingMap[projectId] ?? false
  const { data: session } = useSession()
  const user = session?.user

  const onClickDesigning = () =>
    setDesigningMap((prev) => ({ ...prev, [projectId]: !prev[projectId] }))

  // TODO: check if this works as intended (also: Tree.Project.Editing.tsx)
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
  // console.log('hello project DesignButton', { userRole })

  const userMayDesign = userRole === 'designer' || userRole === 'owner'

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
      />
    </Tooltip>
  )
}
