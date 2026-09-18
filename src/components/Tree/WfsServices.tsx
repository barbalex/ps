import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { WfsServiceNode } from './WfsService.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useWfsServicesNavData } from '../../modules/useWfsServicesNavData.ts'

interface Props {
  projectId: string
  level?: number
}

// mirrors the open rows returned by useWfsServicesNavData's sql
type NavData = {
  id: string
  label: string
  count_unfiltered?: number
  count_filtered?: number
}

export const WfsServicesNode = ({ projectId, level = 3 }: Props) => {
  const navigate = useNavigate()

  const { navData } = useWfsServicesNavData({ projectId })
  const {
    label,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    isOpen,
    isInActiveNodeArray,
    isActive,
    navs,
  } = navData

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }
      return
    }
    addOpenNodes({ nodes: [ownArray] })
  }

  const openNavs = navs as NavData[]
  const showNavs = isOpen && navs.length > 0 && openNavs[0].id

  return (
    <>
      <Node
        label={label}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={navs.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {showNavs &&
        openNavs.map((nav, i) => (
          <WfsServiceNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            nav={nav}
            level={level + 1}
          />
        ))}
    </>
  )
}
