import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPerson } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

export const Header = memo(({ autoFocusRef }: Props) => {
  const { project_id, person_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createPerson({ db, project_id })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.person_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM persons WHERE person_id = $1`, [person_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, person_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT person_id FROM persons WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const persons = res?.rows
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === person_id)
    const next = persons[(index + 1) % len]
    navigate({
      pathname: `../${next.person_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, person_id, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT person_id FROM persons WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const persons = res?.rows
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === person_id)
    const previous = persons[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.person_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, person_id, project_id, searchParams])

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
