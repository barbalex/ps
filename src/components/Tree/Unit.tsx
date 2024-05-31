import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Units as Unit } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  unit: Unit
  level?: number
}

export const UnitNode = memo(({ project_id, unit, level = 4 }: Props) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[1] === 'projects' &&
    urlPath[2] === project_id &&
    urlPath[3] === 'units' &&
    urlPath[4] === unit.unit_id
  const isActive = isOpen && urlPath.length === level + 1

  const ownArray = useMemo(
    () => ['data', 'projects', project_id, 'units'],
    [project_id],
  )
  const baseUrl = ownArray.join('/')

  return (
    <Node
      node={unit}
      id={unit.unit_id}
      level={level}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`${baseUrl}/${unit.unit_id}`}
    />
  )
})
