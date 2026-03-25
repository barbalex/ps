import { Node } from './Node.tsx'
import { useProjectQcsNavData } from '../../modules/useProjectQcsNavData.ts'

interface Props {
  projectId: string
  level?: number
}

export const ProjectQcsNode = ({ projectId, level = 3 }: Props) => {
  const { navData } = useProjectQcsNavData({ projectId })
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
