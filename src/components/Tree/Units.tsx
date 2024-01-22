import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Units as Unit } from '../../../generated/client'
import { UnitNode } from './Unit'

export const UnitsNode = ({ project_id, level = 3 }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.units.liveMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const units: Unit[] = results ?? []

  const unitsNode = useMemo(
    () => ({
      label: `Units (${units.length})`,
    }),
    [units.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'units'
  const isActive = isOpen && urlPath.length === 3

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate(`/projects/${project_id}`)
    navigate(`/projects/${project_id}/units`)
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={unitsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={units.length}
        to={`/projects/${project_id}/units`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        units.map((unit) => (
          <UnitNode key={unit.unit_id} project_id={project_id} unit={unit} />
        ))}
    </>
  )
}
