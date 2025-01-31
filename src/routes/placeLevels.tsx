import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createPlaceLevel } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
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
})
