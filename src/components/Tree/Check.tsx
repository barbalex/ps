import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { CheckValuesNode } from './CheckValues.tsx'
import { CheckTaxaNode } from './CheckTaxa.tsx'
import { FilesNode } from './Files.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const CheckNode = memo(
  ({ projectId, subprojectId, placeId, placeId2, check, level = 8 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()

    // need project to know whether to show files
    const resProject = useLiveIncrementalQuery(
      `SELECT project_id, files_active_checks FROM projects WHERE project_id = $1`,
      [projectId],
      'project_id',
    )
    const project = resProject?.rows?.[0]
    const showFiles = project?.files_active_checks ?? false

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        projectId,
        'subprojects',
        subprojectId,
        'places',
        placeId,
        ...(placeId2 ? ['places', placeId2] : []),
        'checks',
      ],
      [placeId, placeId2, projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, check.check_id],
      [check.check_id, parentArray],
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
          navigate({
            to: parentUrl,
          })
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
          node={check}
          id={check.check_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={10}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <>
            <CheckValuesNode
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              checkId={check.check_id}
              level={level + 1}
            />
            <CheckTaxaNode
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              checkId={check.check_id}
              level={level + 1}
            />
            {showFiles && (
              <FilesNode
                projectId={projectId}
                subprojectId={subprojectId}
                placeId={placeId}
                placeId2={placeId2}
                checkId={check.check_id}
                level={level + 1}
              />
            )}
          </>
        )}
      </>
    )
  },
)
