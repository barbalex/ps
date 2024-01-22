import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Checks as Check } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createCheck } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.checks.liveMany({
        where: { place_id: place_id2 ?? place_id, deleted: false },
        orderBy: { label: 'asc' },
      }),
    [place_id, place_id2],
  )

  const add = useCallback(async () => {
    const data = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.checks.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks/${data.check_id}`,
    )
  }, [db, navigate, place_id, place_id2, project_id, subproject_id])

  const checks: Check[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Checks" addRow={add} tableName="check" />
      <div className="list-container">
        {checks.map(({ check_id, label }) => (
          <Row
            key={check_id}
            label={label}
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/checks/${check_id}`}
          />
        ))}
      </div>
    </div>
  )
}
