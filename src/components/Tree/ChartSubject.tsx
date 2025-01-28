import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Chart_subjects as ChartSubject } from '../../../generated/client/index.ts'

interface Props {
  project_id?: string
  subproject_id?: string
  place_id?: string
  place_id2?: string
  chart_id: string
  chartSubject: ChartSubject
  level: number
}

// not using memo because: "Component is not a function"
export const ChartSubjectNode = ({
  project_id,
  subproject_id,
  place_id,
  place_id2,
  chart_id,
  chartSubject,
  level = 2,
}) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = useMemo(
    () => [
      'data',
      ...(project_id ? ['projects', project_id] : []),
      ...(subproject_id ? ['subprojects', subproject_id] : []),
      ...(place_id ? ['places', place_id] : []),
      ...(place_id2 ? ['places', place_id2] : []),
      'charts',
      chart_id,
      'subjects',
      chartSubject.chart_subject_id,
    ],
    [
      chartSubject.chart_subject_id,
      chart_id,
      place_id,
      place_id2,
      project_id,
      subproject_id,
    ],
  )
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  return (
    <Node
      node={chartSubject}
      id={chartSubject.chart_subject_id}
      level={level}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
    />
  )
}
