import { useCallback } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Chart_subjects as ChartSubject } from '../../../generated/client'

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
      urlPath[10] === 'subjects' &&
      params.chart_subject_id === chartSubject.chart_subject_id
    : place_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'places' &&
      urlPath[5] === place_id &&
      urlPath[6] === 'charts' &&
      urlPath[7] === chart_id &&
      urlPath[8] === 'subjects' &&
      params.chart_subject_id === chartSubject.chart_subject_id
    : subproject_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'charts' &&
      urlPath[5] === chart_id &&
      urlPath[6] === 'subjects' &&
      params.chart_subject_id === chartSubject.chart_subject_id
    : project_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'charts' &&
      urlPath[3] === chart_id &&
      urlPath[4] === 'subjects' &&
      params.chart_subject_id === chartSubject.chart_subject_id
    : false
  const isActive = isOpen && urlPath.length === level

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
    subproject_id ? `/subprojects/${subproject_id}` : ''
  }${place_id ? `/places/${place_id}` : ''}${
    place_id2 ? `/places/${place_id2}` : ''
  }/charts/${chart_id}/subjects`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/${chartSubject.chart_subject_id}`)
  }, [isOpen, navigate, baseUrl, chartSubject.chart_subject_id])

  return (
    <Node
      node={chartSubject}
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
