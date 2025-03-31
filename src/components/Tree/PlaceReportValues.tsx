import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { PlaceReportValueNode } from './PlaceReportValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { usePlaceReportValuesNavData } from '../../modules/usePlaceReportValuesNavData.ts'

interface Props {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  place: Place
  placeReportId: string
  level?: number
}

export const PlaceReportValuesNode = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    placeReportId,
    level = 9,
  }: Props) => {
    const navigate = useNavigate()

    const { navData } = usePlaceReportValuesNavData({
      projectId,
      subprojectId,
      placeId,
      placeId2,
      placeReportId,
    })
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

    const onClickButton = useCallback(() => {
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
    }, [
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentUrl,
      urlPath.length,
    ])

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
        {isOpen &&
          navs.map((nav) => (
            <PlaceReportValueNode
              key={nav.id}
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              placeReportId={placeReportId}
              nav={nav}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
