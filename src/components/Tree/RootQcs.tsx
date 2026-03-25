import { Node } from './Node.tsx'
import { useRootQcsNavData } from '../../modules/useRootQcsNavData.ts'

export const RootQcsNode = ({ level = 1 }: { level?: number }) => {
  const { navData } = useRootQcsNavData()
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
