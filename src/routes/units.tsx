import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createUnit } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { unitsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(unitsFilterAtom)
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT 
      unit_id, 
      label 
    FROM units 
    WHERE 
      project_id = $1
      ${isFiltered ? ` AND ${filterString}` : ''} 
    ORDER BY label`,
    [project_id],
    'unit_id',
  )
  const isLoading = res === undefined
  const units = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createUnit({ db, project_id })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ pathname: data.unit_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Units"
        nameSingular="Unit"
        tableName="units"
        isFiltered={isFiltered}
        countFiltered={units.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {units.map(({ unit_id, label }) => (
              <Row
                key={unit_id}
                label={label ?? unit_id}
                to={unit_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
