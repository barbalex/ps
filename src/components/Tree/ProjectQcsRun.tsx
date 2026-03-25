import { Node } from './Node.tsx'
import { useProjectQcsRunNavData } from '../../modules/useProjectQcsRunNavData.ts'

interface Props {
  projectId: string
  level?: number
}

export const ProjectQcsRunNode = ({ projectId, level = 3 }: Props) => {
  const { navData } = useProjectQcsRunNavData({ projectId })
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
