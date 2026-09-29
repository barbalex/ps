import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { FilteredViewNode } from './FilteredView.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useFilteredViewsNavData } from '../../modules/useFilteredViewsNavData.ts'

type NavData = {
  id: string
  label: string
}[]

interface Props {
  projectId: string
  level?: number
}

export const FilteredViewsNode = ({ projectId, level = 3 }: Props) => {
  const navigate = useNavigate()

  const { navData } = useFilteredViewsNavData({ projectId })
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
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }

  // only list navs if isOpen AND the first nav has an id
  const showNavs = isOpen && navs.length > 0 && (navs as NavData)[0].id

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
        (navs as NavData).map((nav, i) => (
          <FilteredViewNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            nav={nav}
          />
        ))}
    </>
  )
}
