import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createPerson } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, person_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `/projects/${project_id}/persons`

  const addRow = useCallback(async () => {
    const data = await createPerson({ db, project_id })
    await db.persons.create({ data })
    navigate(`${baseUrl}/${data.person_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.persons.delete({
      where: { person_id },
    })
    navigate('..')
  }, [baseUrl, db.persons, navigate, person_id])

  const toNext = useCallback(async () => {
    const persons = await db.persons.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === person_id)
    const next = persons[(index + 1) % len]
    navigate(`${baseUrl}/${next.person_id}`)
  }, [baseUrl, db.persons, navigate, person_id, project_id])

  const toPrevious = useCallback(async () => {
    const persons = await db.persons.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === person_id)
    const previous = persons[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.person_id}`)
  }, [baseUrl, db.persons, navigate, person_id, project_id])

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
