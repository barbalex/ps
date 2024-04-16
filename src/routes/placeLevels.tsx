import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createPlaceLevel } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: placeLevels = [] } = useLiveQuery(
    db.place_levels.liveMany({
      where: { project_id },
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
    navigate({
      pathname: placeLevel.place_level_id,
      search: searchParams.toString(),
    })
  }, [db.place_levels, navigate, project_id, searchParams])

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
            to={place_level_id}
            label={label ?? place_level_id}
          />
        ))}
      </div>
    </div>
  )
}
