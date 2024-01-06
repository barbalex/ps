import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Subprojects as Subproject } from '../../../generated/client'
import { subproject as createNewSubproject } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { ListViewMenu } from '../components/ListViewMenu'
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
    const data = await createNewSubproject({ db, project_id })
    await db.subprojects.create({ data })
    Navigate(`/projects/${project_id}/subprojects/${data.subproject_id}`)
  }, [Navigate, db, project_id])

  const subprojects: Subproject[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="subproject" />
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
