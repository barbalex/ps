import { Node } from './Node.tsx'
import { useRootExportsRunNavData } from '../../modules/useRootExportsRunNavData.ts'

export const RootExportsRunNode = ({ level = 1 }: { level?: number }) => {
  const { navData } = useRootExportsRunNavData()
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
