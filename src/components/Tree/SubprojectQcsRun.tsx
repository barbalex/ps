import { Node } from './Node.tsx'
import { useSubprojectQcsRunNavData } from '../../modules/useSubprojectQcsRunNavData.ts'

interface Props {
  projectId: string
  subprojectId: string
  level?: number
}

export const SubprojectQcsRunNode = ({
  projectId,
  subprojectId,
  level = 5,
}: Props) => {
  const { navData } = useSubprojectQcsRunNavData({ projectId, subprojectId })
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
