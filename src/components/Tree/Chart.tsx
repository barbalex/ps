import { useCallback } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Charts as Chart } from '../../../generated/client'

interface Props {
  project_id?: string
  subproject_id?: string
  chart: Chart
  level: number
}

export const FileNode = ({
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
      params.chart_id === chart.chart_id
    : place_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'places' &&
      urlPath[5] === place_id &&
      urlPath[6] === 'charts' &&
      params.chart_id === chart.chart_id
    : subproject_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'charts' &&
      params.chart_id === chart.chart_id
    : project_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'charts' &&
      params.chart_id === chart.chart_id
    : urlPath[0] === 'charts' && params.chart_id === chart.chart_id
  const isActive = isOpen && urlPath.length === level

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
    subproject_id ? `/subprojects/${subproject_id}` : ''
  }${place_id ? `/places/${place_id}` : ''}${
    place_id2 ? `/places/${place_id2}` : ''
  }/charts`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/${chart.chart_id}`)
  }, [isOpen, navigate, baseUrl, chart.chart_id])

  return (
    <Node
      node={chart}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`${baseUrl}/${chart.chart_id}`}
      onClickButton={onClickButton}
    />
  )
}
