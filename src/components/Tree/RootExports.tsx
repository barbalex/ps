import { Node } from './Node.tsx'
import { useRootExportsNavData } from '../../modules/useRootExportsNavData.ts'

export const RootExportsNode = ({ level = 1 }: { level?: number }) => {
  const { navData } = useRootExportsNavData()
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
