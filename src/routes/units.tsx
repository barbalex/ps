import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Units as Unit } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { unit as createUnitPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.units.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = useCallback(async () => {
    const newUnit = createUnitPreset()
    await db.units.create({
      data: {
        ...newUnit,
        project_id,
      },
    })
    navigate(`/projects/${project_id}/units/${newUnit.unit_id}`)
  }, [db.units, navigate, project_id])

  const units: Unit[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {units.map((unit: Unit, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project_id}/units/${unit.unit_id}`}>
            {unit.label ?? unit.unit_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
