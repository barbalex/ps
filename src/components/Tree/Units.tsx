import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { UnitNode } from './Unit'

interface Props {
  project_id: string
  level?: number
}

export const UnitsNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: units = [] } = useLiveQuery(
    db.units.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const unitsNode = useMemo(
    () => ({ label: `Units (${units.length})` }),
    [units.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'units'
  const isActive = isOpen && urlPath.length === 3

  const baseUrl = `/projects/${project_id}`

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({ pathname: `${baseUrl}/units`, search: searchParams.toString() })
  }, [baseUrl, isOpen, navigate, searchParams])

  return (
    <>
      <Node
        node={unitsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={units.length}
        to={`${baseUrl}/units`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        units.map((unit) => (
          <UnitNode key={unit.unit_id} project_id={project_id} unit={unit} />
        ))}
    </>
  )
})
