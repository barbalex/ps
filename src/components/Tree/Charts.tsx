import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ChartNode } from './Chart'

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

    const { db } = useElectric()!

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
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'places' &&
        urlPath[5] === place_id &&
        urlPath[6] === 'places' &&
        urlPath[7] === place_id2 &&
        urlPath[8] === 'charts'
      : place_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'places' &&
        urlPath[5] === place_id &&
        urlPath[6] === 'charts'
      : subproject_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'charts'
      : project_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'charts'
      : urlPath[0] === 'charts'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
      subproject_id ? `/subprojects/${subproject_id}` : ''
    }${place_id ? `/places/${place_id}` : ''}${
      place_id2 ? `/places/${place_id2}` : ''
    }`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/charts`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

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
