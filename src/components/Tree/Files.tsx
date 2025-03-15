import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import {
  useLiveQuery,
  useLiveIncrementalQuery,
} from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { FileNode } from './File.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom, filesFilterAtom } from '../../store.ts'

interface Props {
  projectId?: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  checkId?: string
  actionId?: string
  level: number
}

export const FilesNode = memo(
  ({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkId,
    actionId,
    level,
  }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [filter] = useAtom(filesFilterAtom)

    const location = useLocation()
    const navigate = useNavigate()

    const { hField, hValue } = useMemo(() => {
      let hField
      let hValue
      if (actionId) {
        hField = 'action_id'
        hValue = actionId
      } else if (checkId) {
        hField = 'check_id'
        hValue = checkId
      } else if (placeId2) {
        hField = 'place_id'
        hValue = placeId2
      } else if (placeId) {
        hField = 'place_id'
        hValue = placeId
      } else if (subprojectId) {
        hField = 'subproject_id'
        hValue = subprojectId
      } else if (projectId) {
        hField = 'project_id'
        hValue = projectId
      }
      return { hField, hValue }
    }, [actionId, checkId, placeId, placeId2, projectId, subprojectId])

    const filterString = filterStringFromFilter(filter)
    const isFiltered = !!filterString
    const resFiltered = useLiveQuery(
      `
      SELECT
        file_id,
        label 
      FROM files 
      WHERE 
        ${hField ? `${hField} = '${hValue}'` : 'true'} 
        ${isFiltered ? ` AND ${filterString} ` : ''} 
      ORDER BY label`,
    )
    const rows = resFiltered?.rows ?? []
    const rowsLoading = resFiltered === undefined

    const resultCountUnfiltered = useLiveQuery(
      `
      SELECT count(*) 
      FROM files 
      WHERE ${hField ? `${hField} = '${hValue}'` : 'true'} `,
    )
    const countUnfiltered = resultCountUnfiltered?.rows?.[0]?.count ?? 0
    const countLoading = resultCountUnfiltered === undefined

    const node = useMemo(
      () => ({
        label: `Files (${
          isFiltered
            ? `${rowsLoading ? '...' : formatNumber(rows.length)}/${
                countLoading ? '...' : formatNumber(countUnfiltered)
              }`
            : rowsLoading
              ? '...'
              : formatNumber(rows.length)
        })`,
      }),
      [isFiltered, rowsLoading, rows.length, countLoading, countUnfiltered],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        ...(projectId ? ['projects', projectId] : []),
        ...(subprojectId ? ['subprojects', subprojectId] : []),
        ...(placeId ? ['places', placeId] : []),
        ...(placeId2 ? ['places', placeId2] : []),
        ...(actionId ? ['actions', actionId] : []),
        ...(checkId ? ['checks', checkId] : []),
      ],
      [actionId, checkId, placeId, placeId2, projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'files'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // TODO: needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

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
          node={node}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={rows.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          rows.map((file) => (
            <FileNode
              key={file.file_id}
              project_id={projectId}
              subproject_id={subprojectId}
              place_id={placeId}
              place_id2={placeId2}
              action_id={actionId}
              check_id={checkId}
              file={file}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
