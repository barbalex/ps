import { Node } from './Node.tsx'
import { useSubprojectQcsNavData } from '../../modules/useSubprojectQcsNavData.ts'

interface Props {
  projectId: string
  subprojectId: string
  level?: number
}

export const SubprojectQcsNode = ({
  projectId,
  subprojectId,
  level = 5,
}: Props) => {
  const { navData } = useSubprojectQcsNavData({ projectId, subprojectId })
  const {
    label,
    ownUrl,
    isInActiveNodeArray,
    isActive,
  } = navData

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
