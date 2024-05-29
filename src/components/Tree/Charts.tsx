import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { ChartNode } from './Chart.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id?: string
  subproject_id?: string
  place_id?: string
  place_id2?: string
  level: number
}

export const ChartsNode = memo(
  ({ project_id, subproject_id, place_id, place_id2, level }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const where = useMemo(() => {
      const where = {}
      if (place_id2) {
        where.place_id = place_id2
      } else if (place_id) {
        where.place_id = place_id
      } else if (subproject_id) {
        where.subproject_id = subproject_id
      } else if (project_id) {
        where.project_id = project_id
      }
      return where
    }, [place_id, place_id2, project_id, subproject_id])

    const { results: charts = [] } = useLiveQuery(
      db.charts.liveMany({
        where,
        orderBy: { label: 'asc' },
      }),
    )

    const chartsNode = useMemo(
      () => ({ label: `Charts (${charts.length})` }),
      [charts.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen = place_id2
      ? urlPath[1] === 'projects' &&
        urlPath[2] === project_id &&
        urlPath[3] === 'subprojects' &&
        urlPath[4] === subproject_id &&
        urlPath[5] === 'places' &&
        urlPath[6] === place_id &&
        urlPath[7] === 'places' &&
        urlPath[8] === place_id2 &&
        urlPath[9] === 'charts'
      : place_id
      ? urlPath[1] === 'projects' &&
        urlPath[2] === project_id &&
        urlPath[3] === 'subprojects' &&
        urlPath[4] === subproject_id &&
        urlPath[5] === 'places' &&
        urlPath[6] === place_id &&
        urlPath[7] === 'charts'
      : subproject_id
      ? urlPath[1] === 'projects' &&
        urlPath[2] === project_id &&
        urlPath[3] === 'subprojects' &&
        urlPath[4] === subproject_id &&
        urlPath[5] === 'charts'
      : project_id
      ? urlPath[1] === 'projects' &&
        urlPath[2] === project_id &&
        urlPath[3] === 'charts'
      : urlPath[1] === 'charts'
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => [
        'data',
        ...(project_id ? ['projects', project_id] : []),
        ...(subproject_id ? ['subprojects', subproject_id] : []),
        ...(place_id ? ['places', place_id] : []),
        ...(place_id2 ? ['places', place_id2] : []),
      ],
      [place_id, place_id2, project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, 'charts'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/charts`,
        search: searchParams.toString(),
      })
    }, [
      appState?.app_state_id,
      baseArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      searchParams,
    ])

    return (
      <>
        <Node
          node={chartsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={charts.length}
          to={`${baseUrl}/charts`}
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
