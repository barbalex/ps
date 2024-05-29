import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { ChartSubjectNode } from './ChartSubject.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id?: string
  subproject_id?: string
  place_id?: string
  place_id2?: string
  chart_id: string
  level: number
}

export const ChartSubjectsNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place_id2,
    chart_id,
    level,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!

    const { results: chartSubjects = [] } = useLiveQuery(
      db.chart_subjects.liveMany({
        where: { chart_id },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const chartSubjectsNode = useMemo(
      () => ({ label: `Subjects (${chartSubjects.length})` }),
      [chartSubjects.length],
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
        urlPath[11] === 'subjects'
      : place_id
      ? urlPath[1] === 'projects' &&
        urlPath[2] === project_id &&
        urlPath[3] === 'subprojects' &&
        urlPath[4] === subproject_id &&
        urlPath[5] === 'places' &&
        urlPath[6] === place_id &&
        urlPath[7] === 'charts' &&
        urlPath[8] === chart_id &&
        urlPath[9] === 'subjects'
      : subproject_id
      ? urlPath[1] === 'projects' &&
        urlPath[2] === project_id &&
        urlPath[3] === 'subprojects' &&
        urlPath[4] === subproject_id &&
        urlPath[5] === 'charts' &&
        urlPath[6] === chart_id &&
        urlPath[7] === 'subjects'
      : project_id
      ? urlPath[1] === 'projects' &&
        urlPath[2] === project_id &&
        urlPath[3] === 'charts' &&
        urlPath[4] === chart_id &&
        urlPath[8] === 'subjects'
      : false
    const isActive = isOpen && urlPath.length === level

    const baseArray = useMemo(
      () => [
        'data',
        ...(project_id ? ['projects', project_id] : []),
        ...(subproject_id ? ['subprojects', subproject_id] : []),
        ...(place_id ? ['places', place_id] : []),
        ...(place_id2 ? ['places', place_id2] : []),
        'charts',
        chart_id,
      ],
      [chart_id, place_id, place_id2, project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, 'subjects'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/subjects`,
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
          node={chartSubjectsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={chartSubjects.length}
          to={`${baseUrl}/subjects`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          chartSubjects.map((chartSubject) => (
            <ChartSubjectNode
              key={chartSubject.chart_subject_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place_id2={place_id2}
              chart_id={chart_id}
              chartSubject={chartSubject}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
