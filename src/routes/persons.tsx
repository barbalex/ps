import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createPerson } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { project_id } = useParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_persons?.filter((f) => Object.keys(f).length > 0) ?? [],
    [appState],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: persons = [] } = useLiveQuery(
    db.persons.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: personsUnfiltered = [] } = useLiveQuery(
    db.persons.liveMany({ where: { project_id }, orderBy: { label: 'asc' } }),
  )
  const isFiltered = persons.length !== personsUnfiltered.length

  const add = useCallback(async () => {
    const data = await createPerson({ db, project_id })
    await db.persons.create({ data })
    navigate({ pathname: data.person_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Persons (${
          isFiltered
            ? `${persons.length}/${personsUnfiltered.length}`
            : persons.length
        })`}
        addRow={add}
        tableName="person"
        menus={
          <FilterButton tableName="persons" filterField="filter_persons" />
        }
      />
      <div className="list-container">
        {persons.map(({ person_id, label }) => (
          <Row key={person_id} to={person_id} label={label ?? person_id} />
        ))}
      </div>
    </div>
  )
})
