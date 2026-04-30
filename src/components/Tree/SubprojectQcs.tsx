import { Node } from './Node.tsx'
import { useSubprojectQcAssignmentsNavData } from '../../modules/useSubprojectQcAssignmentsNavData.ts'

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
  const { navData } = useSubprojectQcAssignmentsNavData({ projectId, subprojectId })
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
