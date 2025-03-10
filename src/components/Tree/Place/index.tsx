import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from '../Node.tsx'
import { PlaceChildren } from './Children.tsx'
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../../store.ts'

export const PlaceNode = memo(
  ({ project_id, subproject_id, place_id, place }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const level = place_id ? 8 : 6
    const place_id1 = place_id ?? place.place_id
    const place_id2 = place_id ? place.place_id : undefined

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        ...(place_id2 ? [place_id1, 'places'] : []),
      ],
      [place_id1, place_id2, project_id, subproject_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, place.place_id],
      [parentArray, place.place_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({ node: ownArray })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({ pathname: parentUrl, search: searchParams.toString() })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({ nodes: [ownArray] })
    }, [
      isOpen,
      ownArray,
      isInActiveNodeArray,
      urlPath.length,
      navigate,
      parentUrl,
      searchParams,
    ])

    return (
      <>
        <Node
          node={place}
          id={place.place_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={10}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <PlaceChildren
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            level={level}
          />
        )}
      </>
    )
  },
)
