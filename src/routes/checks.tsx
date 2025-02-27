import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createCheck } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { checks1FilterAtom, checks2FilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const [checks1Filter] = useAtom(checks1FilterAtom)
  const [checks2Filter] = useAtom(checks2FilterAtom)
  const filter = place_id2 ? checks2Filter : checks1Filter
  const isFiltered = filter.length > 0

  const results = useLiveIncrementalQuery(
    `SELECT check_id, label FROM checks WHERE place_id = $1${
      filter?.length ? ` AND (${filter})` : ''
    } order by label asc`,
    [place_id2 ?? place_id],
    'check_id',
  )
  const checks = results?.rows ?? []

  const add = useCallback(async () => {
    const res = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ pathname: data.check_id, search: searchParams.toString() })
  }, [db, navigate, place_id, place_id2, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Checks"
        nameSingular="check"
        tableName="checks"
        isFiltered={isFiltered}
        countFiltered={checks.length}
        addRow={add}
        menus={
          <>
            <LayerMenu
              table="checks"
              level={place_id2 ? 2 : 1}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {checks.map(({ check_id, label }) => (
          <Row
            key={check_id}
            label={label ?? check_id}
            to={check_id}
          />
        ))}
      </div>
    </div>
  )
})
