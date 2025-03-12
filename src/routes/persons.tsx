import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createPerson } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { personsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(personsFilterAtom)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { project_id } = useParams()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT person_id, label 
    FROM persons 
    WHERE 
      project_id = $1
      ${isFiltered ? ` AND ${filterString} ` : ''} 
    ORDER BY label`,
    [project_id],
    'person_id',
  )
  const isLoading = res === undefined
  const persons = res?.rows ?? []

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
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {persons.map(({ person_id, label }) => (
              <Row
                key={person_id}
                to={person_id}
                label={label ?? person_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
