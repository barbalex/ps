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
import { Chart_subjects as ChartSubject } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id?: string
  subproject_id?: string
  place_id?: string
  place_id2?: string
  chart_id: string
  chartSubject: ChartSubject
  level: number
}

export const ChartSubjectNode = ({
  project_id,
  subproject_id,
  place_id,
  place_id2,
  chart_id,
  chartSubject,
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
      urlPath[10] === chart_id &&
      urlPath[11] === 'subjects' &&
      params.chart_subject_id === chartSubject.chart_subject_id
    : place_id
    ? urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'places' &&
      urlPath[6] === place_id &&
      urlPath[7] === 'charts' &&
      urlPath[8] === chart_id &&
      urlPath[9] === 'subjects' &&
      params.chart_subject_id === chartSubject.chart_subject_id
    : subproject_id
    ? urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'charts' &&
      urlPath[6] === chart_id &&
      urlPath[7] === 'subjects' &&
      params.chart_subject_id === chartSubject.chart_subject_id
    : project_id
    ? urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'charts' &&
      urlPath[4] === chart_id &&
      urlPath[5] === 'subjects' &&
      params.chart_subject_id === chartSubject.chart_subject_id
    : false
  const isActive = isOpen && urlPath.length === level + 1

  const baseArray = useMemo(
    () => [
      'data',
      ...(project_id ? ['projects', project_id] : []),
      ...(subproject_id ? ['subprojects', subproject_id] : []),
      ...(place_id ? ['places', place_id] : []),
      ...(place_id2 ? ['places', place_id2] : []),
      'charts',
      chart_id,
      'subjects',
    ],
    [chart_id, place_id, place_id2, project_id, subproject_id],
  )
  const baseUrl = baseArray.join('/')

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: [...baseArray, chartSubject.chart_subject_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/${chartSubject.chart_subject_id}`,
      search: searchParams.toString(),
    })
  }, [
    isOpen,
    navigate,
    baseUrl,
    chartSubject.chart_subject_id,
    searchParams,
    baseArray,
    db,
    appState?.app_state_id,
  ])

  return (
    <Node
      node={chartSubject}
      id={chartSubject.chart_subject_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`${baseUrl}/${chartSubject.chart_subject_id}`}
      onClickButton={onClickButton}
    />
  )
}
