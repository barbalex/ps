import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Subprojects as Subproject } from '../../../generated/client'
import { subproject as createSubprojectPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const Navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.subprojects.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = useCallback(async () => {
    const newSubproject = createSubprojectPreset()
    await db.subprojects.create({
      data: {
        ...newSubproject,
        project_id,
      },
    })
    Navigate(
      `/projects/${project_id}/subprojects/${newSubproject.subproject_id}`,
    )
  }, [Navigate, db.subprojects, project_id])

  const subprojects: Subproject[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {subprojects.map((subproject: Subproject, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${subproject.project_id}/subprojects/${subproject.subproject_id}`}
          >
            {subproject.label ?? subproject.subproject_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
