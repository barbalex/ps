import { Node } from './Node.tsx'
import { useProjectExportsRunNavData } from '../../modules/useProjectExportsRunNavData.ts'

interface Props {
  projectId: string
  level?: number
}

export const ProjectExportsRunNode = ({ projectId, level = 3 }: Props) => {
  const { navData } = useProjectExportsRunNavData({ projectId })
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
