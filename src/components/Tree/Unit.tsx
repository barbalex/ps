import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Units as Unit } from '../../../generated/client'

interface Props {
  project_id: string
  unit: Unit
  level?: number
}

export const UnitNode = memo(({ project_id, unit, level = 4 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'units' &&
    urlPath[3] === unit.unit_id
  const isActive = isOpen && urlPath.length === 4

  const baseUrl = `/projects/${project_id}/units`

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(baseUrl)
    navigate(`${baseUrl}/${unit.unit_id}`)
  }, [baseUrl, isOpen, navigate, unit.unit_id])

  return (
    <Node
      node={unit}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`${baseUrl}/${unit.unit_id}`}
      onClickButton={onClickButton}
    />
  )
})
