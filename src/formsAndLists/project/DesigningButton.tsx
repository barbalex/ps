import { MdEdit, MdEditOff } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { ToggleButton, Tooltip } = fluentUiReactComponents
import { useAtom, useAtomValue } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { designingAtom, userIdAtom } from '../../store.ts'

export const DesigningButton = ({ from }) => {
  const [designingMap, setDesigningMap] = useAtom(designingAtom)
  const { projectId } = useParams({ from })
  const designing = designingMap[projectId] ?? false
  const userId = useAtomValue(userIdAtom)

  const onClickDesigning = () =>
    setDesigningMap((prev) => ({ ...prev, [projectId]: !prev[projectId] }))

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
      <ToggleButton
        checked={designing}
        icon={designing ? <MdEditOff /> : <MdEdit />}
        onClick={onClickDesigning}
      />
    </Tooltip>
  )
}
