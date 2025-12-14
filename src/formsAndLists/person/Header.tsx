import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createPerson } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

const from = '/data/projects/$projectId_/persons/$personId/'

export const Header = ({ autoFocusRef }: Props) => {
  const { projectId, personId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createPerson({ db, projectId })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.person_id}`,
      params: (prev) => ({ ...prev, personId: data.person_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM persons WHERE person_id = $1`,
      [personId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    await db.query(`DELETE FROM persons WHERE person_id = $1`, [personId])
    addOperation({
      table: 'persons',
      rowIdName: 'person_id',
      rowId: personId,
      operation: 'delete',
      prev,
    })
    navigate({ to: '..' })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

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
}
