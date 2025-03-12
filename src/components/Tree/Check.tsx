import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
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
  ({ project_id, subproject_id, place_id, check, place, level = 8 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // need project to know whether to show files
    const resProject = useLiveIncrementalQuery(
      `SELECT project_id, files_active_checks FROM projects WHERE project_id = $1`,
      [project_id],
      'project_id',
    )
    const project = resProject?.rows?.[0]
    const showFiles = project?.files_active_checks ?? false

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
        'checks',
      ],
      [place.place_id, place_id, project_id, subproject_id],
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
            pathname: parentUrl,
            search: searchParams.toString(),
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
      searchParams,
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
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check_id={check.check_id}
              level={level + 1}
            />
            <CheckTaxaNode
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check_id={check.check_id}
              level={level + 1}
            />
            {showFiles && (
              <FilesNode
                project_id={project_id}
                subproject_id={subproject_id}
                place_id={place_id ?? place.place_id}
                place_id2={place_id ? place.place_id : undefined}
                check_id={check.check_id}
                level={level + 1}
              />
            )}
          </>
        )}
      </>
    )
  },
)
