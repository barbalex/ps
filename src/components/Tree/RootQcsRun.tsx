import { Node } from './Node.tsx'
import { useRootQcsRunNavData } from '../../modules/useRootQcsRunNavData.ts'

export const RootQcsRunNode = ({ level = 1 }: { level?: number }) => {
  const { navData } = useRootQcsRunNavData()
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
