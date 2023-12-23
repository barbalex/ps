import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Lists as List } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { list as createListPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.lists.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = useCallback(async () => {
    const newList = createListPreset()
    await db.lists.create({
      data: {
        ...newList,
        project_id,
      },
    })
    navigate(`/projects/${project_id}/lists/${newList.list_id}`)
  }, [db.lists, navigate, project_id])

  const lists: List[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {lists.map((list: List, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project_id}/lists/${list.list_id}`}>
            {list.label ?? list.list_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
