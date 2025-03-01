import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createPlaceLevel } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT place_level_id, label FROM place_levels WHERE project_id = $1 ORDER BY label ASC`,
    [project_id],
    'place_level_id',
  )
  const isLoading = res === undefined
  const placeLevels = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createPlaceLevel({ db, project_id })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.place_level_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Place Levels"
        nameSingular="Place Level"
        tableName="place level"
        addRow={add}
        isFiltered={false}
        countFiltered={placeLevels.length}
        isLoading={isLoading}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {placeLevels.map(({ place_level_id, label }) => (
              <Row
                key={place_level_id}
                to={place_level_id}
                label={label ?? place_level_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
