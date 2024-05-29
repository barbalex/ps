import { useCallback, useMemo } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { Charts as Chart } from '../../../generated/client/index.ts'
import { ChartSubjectsNode } from './ChartSubjects.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id?: string
  subproject_id?: string
  place_id?: string
  place_id2?: string
  chart: Chart
  level: number
}

export const ChartNode = ({
  project_id,
  subproject_id,
  place_id,
  place_id2,
  chart,
  level = 2,
}: Props) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
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
      urlPath[9] === 'charts' &&
      params.chart_id === chart.chart_id
    : place_id
    ? urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'places' &&
      urlPath[6] === place_id &&
      urlPath[7] === 'charts' &&
      params.chart_id === chart.chart_id
    : subproject_id
    ? urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'charts' &&
      params.chart_id === chart.chart_id
    : project_id
    ? urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'charts' &&
      params.chart_id === chart.chart_id
    : urlPath[1] === 'charts' && params.chart_id === chart.chart_id
  const isActive = isOpen && urlPath.length === level + 1

  const baseArray = useMemo(
    () => [
      'data',
      ...(project_id ? ['projects', project_id] : []),
      ...(subproject_id ? ['subprojects', subproject_id] : []),
      ...(place_id ? ['places', place_id] : []),
      ...(place_id2 ? ['places', place_id2] : []),
      'charts',
    ],
    [place_id, place_id2, project_id, subproject_id],
  )
  const baseUrl = baseArray.join('/')

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: [...baseArray, chart.chart_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/${chart.chart_id}`,
      search: searchParams.toString(),
    })
  }, [
    isOpen,
    navigate,
    baseUrl,
    chart.chart_id,
    searchParams,
    baseArray,
    db,
    appState?.app_state_id,
  ])

  return (
    <>
      <Node
        node={chart}
        id={chart.chart_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${chart.chart_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <ChartSubjectsNode
          project_id={project_id}
          subproject_id={subproject_id}
          place_id={place_id}
          place_id2={place_id2}
          chart_id={chart.chart_id}
          level={level + 1}
        />
      )}
    </>
  )
}
