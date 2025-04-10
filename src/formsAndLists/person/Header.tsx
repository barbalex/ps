import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPerson } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

const from = '/data/projects/$projectId_/persons/$personId/'

export const Header = memo(({ autoFocusRef }: Props) => {
  const { projectId, personId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createPerson({ db, projectId })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.person_id}`,
      params: (prev) => ({ ...prev, personId: data.person_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM persons WHERE person_id = $1`, [personId])
    navigate({ to: '..' })
  }, [db, navigate, personId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT person_id FROM persons WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const persons = res?.rows
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === personId)
    const next = persons[(index + 1) % len]
    navigate({
      to: `../${next.person_id}`,
      params: (prev) => ({ ...prev, personId: next.person_id }),
    })
  }, [db, navigate, personId, projectId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT person_id FROM persons WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const persons = res?.rows
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === personId)
    const previous = persons[(index + len - 1) % len]
    navigate({
      to: `../${previous.person_id}`,
      params: (prev) => ({ ...prev, personId: previous.person_id }),
    })
  }, [db, navigate, personId, projectId])

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
