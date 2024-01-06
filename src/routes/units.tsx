import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Units as Unit } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { unit as createUnit } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
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
    const unit = createUnit()
    await db.units.create({
      data: {
        ...unit,
        project_id,
      },
    })
    navigate(`/projects/${project_id}/units/${unit.unit_id}`)
  }, [db.units, navigate, project_id])

  const units: Unit[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="unit" />
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
