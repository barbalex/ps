import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { useElectric } from '../ElectricProvider.tsx'
import { createPerson } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { personsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(personsFilterAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { project_id } = useParams()
  const db = usePGlite()

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
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {persons.map(({ person_id, label }) => (
          <Row
            key={person_id}
            to={person_id}
            label={label ?? person_id}
          />
        ))}
      </div>
    </div>
  )
})
