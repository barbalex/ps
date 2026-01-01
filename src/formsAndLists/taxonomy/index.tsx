import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Type } from './Type.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Taxonomies from '../../models/public/Taxonomies.ts'

import '../../form.css'

export const Taxonomy = ({ from }) => {
  const { taxonomyId } = useParams({ from })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(`SELECT * FROM taxonomies WHERE taxonomy_id = $1`, [
    taxonomyId,
  ])
  const row: Taxonomies | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    await db.query(
      `UPDATE taxonomies SET ${name} = $1 WHERE taxonomy_id = $2`,
      [value, taxonomyId],
    )
    addOperation({
      table: 'taxonomies',
      rowIdName: 'taxonomy_id',
      rowId: taxonomyId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Taxonomy" id={taxonomyId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <Type row={row} onChange={onChange} />
        <TextField
          label="Url"
          name="url"
          type="url"
          value={row.url ?? ''}
          onChange={onChange}
        />
        <Jsonb
          table="taxonomies"
          idField="taxonomy_id"
          id={row.taxonomy_id}
          data={row.data ?? {}}
        />
        <SwitchField
          label="Obsolete"
          name="obsolete"
          value={row.obsolete ?? false}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
