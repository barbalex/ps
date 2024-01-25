import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { PlaceLevels as PlaceLevel } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createPlaceLevel } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.place_levels.liveMany({
      where: { project_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const placeLevel = createPlaceLevel()
    await db.place_levels.create({
      data: {
        ...placeLevel,
        project_id,
      },
    })
    navigate(
      `/projects/${project_id}/place-levels/${placeLevel.place_level_id}`,
    )
  }, [db.place_levels, navigate, project_id])

  const placeLevels: PlaceLevel[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Place Levels"
        addRow={add}
        tableName="place level"
      />
      <div className="list-container">
        {placeLevels.map(({ place_level_id, label }) => (
          <Row
            key={place_level_id}
            to={`/projects/${project_id}/place-levels/${place_level_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
