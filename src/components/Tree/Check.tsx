import { useLocation, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { CheckValuesNode } from './CheckValues.tsx'
import { CheckTaxaNode } from './CheckTaxa.tsx'
import { FilesNode } from './Files.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const CheckNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  nav,
  level = 8,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  // need project to know whether to show files
  const res = useLiveQuery(
    `SELECT check_files, check_values, check_taxa
     FROM place_levels
     WHERE project_id = $1 AND (level IS NULL OR level = $2)`,
    [projectId, placeId2 ? 2 : 1],
  )
  const row = res?.rows?.[0]
  const showFiles = row?.check_files !== false
  const placeLevel = row

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'checks',
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
        navigate({
          to: parentUrl,
        })
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
        id={nav.id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={11}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <Node
            label="Check"
            level={level + 1}
            isInActiveNodeArray={
              ownArray.every((part, i) => urlPath[i] === part) &&
              urlPath[ownArray.length] === 'check'
            }
            isActive={isEqual([...ownArray, 'check'], urlPath)}
            childrenCount={0}
            to={`${ownUrl}/check`}
          />
          {placeLevel?.check_values !== false && (
            <CheckValuesNode
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              checkId={nav.id}
              level={level + 1}
            />
          )}
          {placeLevel?.check_taxa !== false && (
            <CheckTaxaNode
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              checkId={nav.id}
              level={level + 1}
            />
          )}
          {showFiles && (
            <FilesNode
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              checkId={nav.id}
              level={level + 1}
            />
          )}
        </>
      )}
    </>
  )
}
