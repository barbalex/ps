import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'

import type SubprojectHistories from '../../models/public/SubprojectHistories.ts'

const formFrom =
  '/data/projects/$projectId_/subprojects/$subprojectId_/histories/$subprojectHistoryId'

export const SubprojectHistoryForm = ({ from, autoFocusRef }) => {
  const { subprojectHistoryId } = useParams({ from: formFrom })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM subproject_histories WHERE subproject_history_id = $1`,
    [subprojectHistoryId],
  )
  const row: SubprojectHistories | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE subproject_histories SET ${name} = $1 WHERE subproject_history_id = $2`,
        [value, subprojectHistoryId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'subproject_histories',
      rowIdName: 'subproject_history_id',
      rowId: row.subproject_history_id,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Subproject History"
        id={subprojectHistoryId}
      />
    )
  }

  return (
  <div className="form-container">
    <TextField
      label="Year"
      name="year"
      value={row.year ?? ''}
      type="number"
      onChange={onChange}
      autoFocus
      ref={autoFocusRef}
      validationState={validations?.year?.state}
      validationMessage={validations?.year?.message}
    />
    <TextField
      label="Name"
      name="name"
      value={row.name ?? ''}
      onChange={onChange}
      validationState={validations?.name?.state}
      validationMessage={validations?.name?.message}
    />
    <TextField
      label="Start year"
      name="start_year"
      value={row.start_year ?? ''}
      type="number"
      onChange={onChange}
      validationState={validations?.start_year?.state}
      validationMessage={validations?.start_year?.message}
    />
    <TextField
      label="End year"
      name="end_year"
      value={row.end_year ?? ''}
      type="number"
      onChange={onChange}
      validationState={validations?.end_year?.state}
      validationMessage={validations?.end_year?.message}
    />
    <Jsonb
      table="subproject_histories"
      idField="subproject_history_id"
      id={row.subproject_history_id}
      data={row.data ?? {}}
      from={from}
    />
  </div>
  )
}
