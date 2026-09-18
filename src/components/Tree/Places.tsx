import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { PlaceNode } from './Place/index.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { usePlacesNavData } from '../../modules/usePlacesNavData.ts'

// mirrors the open-state row shape selected in usePlacesNavData
type NavDataOpen = {
  id: string
  label: string | null
  count_unfiltered: number
  count_filtered: number
  name_singular: string
  name_plural: string
}

interface Props {
  projectId: string
  subprojectId: string
  placeId?: string
  level: number
}

export const PlacesNode = ({
  projectId,
  subprojectId,
  placeId,
  level,
}: Props) => {
  const navigate = useNavigate()

  const { navData } = usePlacesNavData({ projectId, subprojectId, placeId })
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

  // console.log('PlacesNode', {
  //   openNodes,
  //   isOpen,
  //   ownUrl,
  //   ownArray,
  //   parentArray,
  //   parentUrl,
  // })

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

  // when open, navs are selected with place_id AS id (see usePlacesNavData)
  const openNavs = navs as NavDataOpen[]

  // only list navs if isOpen AND the first nav has an id
  const showNavs = isOpen && openNavs.length > 0 && openNavs[0].id

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
          <PlaceNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            subprojectId={subprojectId}
            placeId={placeId ?? nav.id}
            placeId2={placeId ? nav.id : undefined}
            nav={nav}
            level={level + 1}
          />
        ))}
    </>
  )
}
