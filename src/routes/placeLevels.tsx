import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { PlaceLevels as PlaceLevel } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { placeLevel as createNewPlaceLevel } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.place_levels.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = useCallback(async () => {
    const newPlaceLevel = createNewPlaceLevel()
    await db.place_levels.create({
      data: {
        ...newPlaceLevel,
        project_id,
      },
    })
    navigate(
      `/projects/${project_id}/place-levels/${newPlaceLevel.place_level_id}`,
    )
  }, [db.place_levels, navigate, project_id])

  const placeLevels: PlaceLevel[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="place level" />
      {placeLevels.map((placeLevel: PlaceLevel, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/place-levels/${placeLevel.place_level_id}`}
          >
            {placeLevel.label ?? placeLevel.place_level_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
