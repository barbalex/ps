import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Checks as Check } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { check as createCheckPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.checks.liveMany({ where: { place_id, deleted: false } }),
    [place_id],
  )

  const add = useCallback(async () => {
    const newCheck = createCheckPreset()
    await db.checks.create({
      data: {
        ...newCheck,
        place_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${newCheck.check_id}`,
    )
  }, [db.checks, navigate, place_id, project_id, subproject_id])

  const checks: Check[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {checks.map((check: Check, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check.check_id}`}
          >
            {check.label ?? check.check_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
