import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { TaxonomyForm } from './Form.tsx'
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
        <TaxonomyForm
          row={row}
          onChange={onChange}
          validations={validations}
          autoFocusRef={autoFocusRef}
          projectId={projectId}
        />
      </div>
    </div>
  )
}
