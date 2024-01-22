import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Units as Unit } from '../../../generated/client'

export const UnitNode = ({
  project_id,
  unit,
  level = 4,
}: {
  project_id: string
  unit: Unit
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'units' &&
    urlPath[3] === unit.unit_id
  const isActive = isOpen && urlPath.length === 4

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}/units`)
    navigate(`/projects/${project_id}/units/${unit.unit_id}`)
  }, [isOpen, navigate, project_id, unit.unit_id])

  return (
    <Node
      node={unit}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`/projects/${project_id}/units/${unit.unit_id}`}
      onClickButton={onClickButton}
    />
  )
}
