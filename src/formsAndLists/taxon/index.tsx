import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Taxa from '../../models/public/Taxa.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxa/$taxonId/'

export const Taxon = () => {
  const { taxonId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM taxa WHERE taxon_id = $1`, [taxonId])
  const row: Taxa | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    await db.query(`UPDATE taxa SET ${name} = $1 WHERE taxon_id = $2`, [
      value,
      taxonId,
    ])
    addOperation({
      table: 'taxa',
      rowIdName: 'taxon_id',
      rowId: taxonId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Taxon" id={taxonId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="ID in source"
          name="id_in_source"
          value={row.id_in_source ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Url"
          name="url"
          type="url"
          value={row.url ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
