import { Node } from './Node.tsx'
import { useProjectExportAssignmentsNavData } from '../../modules/useProjectExportAssignmentsNavData.ts'

interface Props {
  projectId: string
  level?: number
}

export const ProjectExportAssignmentsNode = ({ projectId, level = 3 }: Props) => {
  const { navData } = useProjectExportAssignmentsNavData({ projectId })
  const { label, ownUrl, isInActiveNodeArray, isActive } = navData

  return (
    <Node
      label={label}
      level={level}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
    />
  )
}
