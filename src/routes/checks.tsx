import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Checks as Check } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createCheck } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.checks.liveMany({
        where: { place_id: place_id2 ?? place_id, deleted: false },
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
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="check" />
      {checks.map((check: Check, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/checks/${check.check_id}`}
          >
            {check.label ?? check.check_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
