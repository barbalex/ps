import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createPlaceLevel } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/place-levels/'

export const PlaceLevels = memo(() => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT place_level_id, label FROM place_levels WHERE project_id = $1 ORDER BY label`,
    [projectId],
    'place_level_id',
  )
  const isLoading = res === undefined
  const placeLevels = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createPlaceLevel({ db, project_id: projectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: `/data/project/${projectId}/place-levels/${data.place_level_id}`,
      params: (prev) => ({ ...prev, placeLevelId: data.place_level_id }),
    })
  }, [db, navigate, projectId])

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
