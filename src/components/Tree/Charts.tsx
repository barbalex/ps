import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { ChartNode } from './Chart.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  projectId?: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  level: number
}

export const ChartsNode = memo(
  ({ projectId, subprojectId, placeId, placeId2, level }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()

    const { field, value } = useMemo(() => {
      let field
      let value
      if (placeId2) {
        field = 'place_id'
        value = placeId2
      } else if (placeId) {
        field = 'place_id'
        value = placeId
      } else if (subprojectId) {
        field = 'subproject_id'
        value = subprojectId
      } else if (projectId) {
        field = 'project_id'
        value = projectId
      }
      return { field, value }
    }, [placeId, placeId2, projectId, subprojectId])

    const res = useLiveIncrementalQuery(
      `SELECT * FROM charts WHERE ${field} = $1 ORDER BY label`,
      [value],
      'chart_id',
    )
    const rows = res?.rows ?? []
    const loading = res === undefined

    const node = useMemo(
      () => ({
        label: `Charts (${loading ? '...' : formatNumber(rows.length)})`,
      }),
      [loading, rows.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        ...(projectId ? ['projects', projectId] : []),
        ...(subprojectId ? ['subprojects', subprojectId] : []),
        ...(placeId ? ['places', placeId] : []),
        ...(placeId2 ? ['places', placeId2] : []),
      ],
      [placeId, placeId2, projectId, subprojectId],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'charts'], [parentArray])
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
          rows.map((chart) => (
            <ChartNode
              key={chart.chart_id}
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              chart={chart}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
