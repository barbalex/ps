import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { ChartSubjectsNode } from './ChartSubjects.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const ChartNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  nav,
  level = 2,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = [
    'data',
    ...(projectId ? ['projects', projectId] : []),
    ...(subprojectId ? ['subprojects', subprojectId] : []),
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
    'charts',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
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
        label={nav.lbael}
        id={nav.id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <ChartSubjectsNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          chartId={nav.id}
          level={level + 1}
        />
      )}
    </>
  )
}
