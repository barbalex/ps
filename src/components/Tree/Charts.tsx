import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { ChartNode } from './Chart.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id?: string
  subproject_id?: string
  place_id?: string
  place_id2?: string
  level: number
}

export const ChartsNode = memo(
  ({ project_id, subproject_id, place_id, place_id2, level }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { field, value } = useMemo(() => {
      let field
      let value
      if (place_id2) {
        field = 'place_id'
        value = place_id2
      } else if (place_id) {
        field = 'place_id'
        value = place_id
      } else if (subproject_id) {
        field = 'subproject_id'
        value = subproject_id
      } else if (project_id) {
        field = 'project_id'
        value = project_id
      }
      return { field, value }
    }, [place_id, place_id2, project_id, subproject_id])

    const result = useLiveIncrementalQuery(
      `SELECT * FROM charts WHERE ${field} = $1 order by label asc`,
      [value],
      'chart_id',
    )
    const charts = result?.rows ?? []

    const chartsNode = useMemo(
      () => ({ label: `Charts (${charts.length})` }),
      [charts.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        ...(project_id ? ['projects', project_id] : []),
        ...(subproject_id ? ['subprojects', subproject_id] : []),
        ...(place_id ? ['places', place_id] : []),
        ...(place_id2 ? ['places', place_id2] : []),
      ],
      [place_id, place_id2, project_id, subproject_id],
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
          node={chartsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={charts.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          charts.map((chart) => (
            <ChartNode
              key={chart.chart_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place_id2={place_id2}
              chart={chart}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
