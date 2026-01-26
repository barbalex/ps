import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { Node } from '../Node.tsx'
import { PlaceChildren } from './Children.tsx'
import { removeChildNodes } from '../../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../../store.ts'

export const PlaceNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  nav,
  level,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  // const level = placeId2 ? 8 : 6

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    ...(placeId2 ? [placeId, 'places'] : []),
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, placeId2 ?? placeId]
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

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

  return (
    <>
      <Node
        label={nav.label}
        id={placeId2 ?? placeId}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={11}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <PlaceChildren
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level}
        />
      )}
    </>
  )
}
