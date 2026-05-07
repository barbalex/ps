import { Node } from './Node.tsx'
import { useSubprojectExportAssignmentsNavData } from '../../modules/useSubprojectExportAssignmentsNavData.ts'

interface Props {
  projectId: string
  subprojectId: string
  level?: number
}

export const SubprojectExportAssignmentsNode = ({
  projectId,
  subprojectId,
  level = 5,
}: Props) => {
  const { navData } = useSubprojectExportAssignmentsNavData({
    projectId,
    subprojectId,
  })
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
