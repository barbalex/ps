import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPerson } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, person_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const data = await createPerson({ db, project_id })
    await db.persons.create({ data })
    navigate({
      pathname: `../${data.person_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.persons.delete({ where: { person_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.persons, navigate, person_id, searchParams])

  const toNext = useCallback(async () => {
    const persons = await db.persons.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === person_id)
    const next = persons[(index + 1) % len]
    navigate({
      pathname: `../${next.person_id}`,
      search: searchParams.toString(),
    })
  }, [db.persons, navigate, person_id, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const persons = await db.persons.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === person_id)
    const previous = persons[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.person_id}`,
      search: searchParams.toString(),
    })
  }, [db.persons, navigate, person_id, project_id, searchParams])

  return (
    <FormHeader
      title="Person"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="person"
    />
  )
})
