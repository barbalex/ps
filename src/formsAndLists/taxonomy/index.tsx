import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
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
  const { projectId, taxonomyId } = useParams({ from })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const { formatMessage } = useIntl()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(`SELECT * FROM taxonomies WHERE taxonomy_id = $1`, [
    taxonomyId,
  ])
  const row: Taxonomies | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE taxonomies SET ${name} = $1 WHERE taxonomy_id = $2`,
        [value, taxonomyId],
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
    return (
      <NotFound
        table={formatMessage({ id: '6MNIJU', defaultMessage: 'Taxonomie' })}
        id={taxonomyId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        <TextField
          label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.name?.state}
          validationMessage={validations?.name?.message}
        />
        <Type row={row} onChange={onChange} validations={validations} />
        <DropdownField
          label={formatMessage({ id: 'bDkNqO', defaultMessage: 'Einheit' })}
          name="unit_id"
          table="units"
          idField="unit_id"
          where={`project_id = '${projectId}'`}
          value={row.unit_id ?? ''}
          onChange={onChange}
          validationState={validations?.unit_id?.state}
          validationMessage={
            validations?.unit_id?.message ??
            formatMessage({
              id: 'vU6WxY',
              defaultMessage:
                'Einheit der Taxonomie. Hilft bei der Analyse von Daten in Berichten. Beispiele: «Abundanzklasse», «Deckung». Wenn keine Einheit gesetzt ist, wird angenommen, dass die Taxonomie nur Präsenz beschreibt.',
            })
          }
        />
        <TextField
          label={formatMessage({ id: 'TpzCEx', defaultMessage: 'Url' })}
          name="url"
          type="url"
          value={row.url ?? ''}
          onChange={onChange}
          validationState={validations?.url?.state}
          validationMessage={validations?.url?.message}
        />
        <Jsonb
          table="taxonomies"
          idField="taxonomy_id"
          id={row.taxonomy_id}
          data={row.data ?? {}}
        />
        <SwitchField
          label={formatMessage({ id: 'Ob2kQz', defaultMessage: 'Obsolet' })}
          name="obsolete"
          value={row.obsolete ?? false}
          onChange={onChange}
          validationState={validations?.obsolete?.state}
          validationMessage={validations?.obsolete?.message}
        />
      </div>
    </div>
  )
}
