import { useCallback, memo, use } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createPerson } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { personsFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(personsFilterAtom)
  const isFiltered = !!filter

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { project_id } = useParams()
  const db = usePGlite()

  const result = useLiveIncrementalQuery(
    `SELECT person_id, label FROM persons WHERE project_id = $1${
      isFiltered ? ` AND(${filter})` : ''
    } ORDER BY label ASC`,
    [project_id],
    'person_id',
  )
  const persons = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createPerson({ db, project_id })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ pathname: data.person_id, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Persons"
        nameSingular="person"
        tableName="persons"
        ifFiltered={isFiltered}
        countFiltered={persons.length}
        addRow={add}
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
