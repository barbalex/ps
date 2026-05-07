import { Node } from './Node.tsx'
import { useSubprojectExportsRunNavData } from '../../modules/useSubprojectExportsRunNavData.ts'

interface Props {
  projectId: string
  subprojectId: string
  level?: number
}

export const SubprojectExportsRunNode = ({
  projectId,
  subprojectId,
  level = 5,
}: Props) => {
  const { navData } = useSubprojectExportsRunNavData({ projectId, subprojectId })
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
