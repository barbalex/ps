import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ChartSubjectNode } from './ChartSubject'

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

    const { db } = useElectric()!

    const { results: chartSubjects = [] } = useLiveQuery(
      db.chart_subjects.liveMany({
        where: { chart_id, deleted: false },
        orderBy: { label: 'asc' },
      }),
    )

    const chartSubjectsNode = useMemo(
      () => ({ label: `Subjects (${chartSubjects.length})` }),
      [chartSubjects.length],
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
        urlPath[8] === 'charts' &&
        urlPath[9] === chart_id &&
        urlPath[10] === 'subjects'
      : place_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'places' &&
        urlPath[5] === place_id &&
        urlPath[6] === 'charts' &&
        urlPath[7] === chart_id &&
        urlPath[8] === 'subjects'
      : subproject_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'subprojects' &&
        urlPath[3] === subproject_id &&
        urlPath[4] === 'charts' &&
        urlPath[5] === chart_id &&
        urlPath[6] === 'subjects'
      : project_id
      ? urlPath[0] === 'projects' &&
        urlPath[1] === project_id &&
        urlPath[2] === 'charts' &&
        urlPath[3] === chart_id &&
        urlPath[4] === 'subjects'
      : false
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
      subproject_id ? `/subprojects/${subproject_id}` : ''
    }${place_id ? `/places/${place_id}` : ''}${
      place_id2 ? `/places/${place_id2}` : ''
    }/charts/${chart_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/subjects`)
    }, [baseUrl, isOpen, navigate])

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
