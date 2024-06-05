import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createCheck } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'

import '../form.css'

export const Component = memo(() => {
  const { project_id, place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const filterField = place_id2 ? 'filter_checks_2' : 'filter_checks_1'

  const filter = useMemo(
    () =>
      appState?.[filterField]?.filter((f) => Object.keys(f).length > 0) ?? [],
    [appState, filterField],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: checks = [] } = useLiveQuery(
    db.checks.liveMany({
      where: { place_id: place_id2 ?? place_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: checksUnfiltered = [] } = useLiveQuery(
    db.checks.liveMany({
      where: { place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = checks.length !== checksUnfiltered.length

  const add = useCallback(async () => {
    const data = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.checks.create({ data })
    navigate({ pathname: data.check_id, search: searchParams.toString() })
  }, [db, navigate, place_id, place_id2, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Checks (${
          isFiltered
            ? `${checks.length}/${checksUnfiltered.length}`
            : checks.length
        })`}
        addRow={add}
        tableName="check"
        menus={
          <>
            <LayerMenu table="checks" level={place_id2 ? 2 : 1} />
            <FilterButton table="checks" filterField={filterField} />
          </>
        }
      />
      <div className="list-container">
        {checks.map(({ check_id, label }) => (
          <Row key={check_id} label={label ?? check_id} to={check_id} />
        ))}
      </div>
    </div>
  )
})
