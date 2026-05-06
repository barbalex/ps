import { Node } from './Node.tsx'
import { useProjectQcAssignmentsNavData } from '../../modules/useProjectQcAssignmentsNavData.ts'

interface Props {
  projectId: string
  level?: number
}

export const ProjectQcAssignmentsNode = ({ projectId, level = 3 }: Props) => {
  const { navData } = useProjectQcAssignmentsNavData({ projectId })
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
