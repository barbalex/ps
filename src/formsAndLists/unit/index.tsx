import { useCallback, useRef, memo } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { UnitForm as Form } from './Form.tsx'

import '../../form.css'

const from = '/data/projects/$projectId_/units/$unitId/'

export const Unit = memo(() => {
  const { unitId } = useParams({ from })
  const db = usePGlite()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveIncrementalQuery(
    `SELECT * FROM units WHERE unit_id = $1`,
    [unitId],
    'unit_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(`UPDATE units SET ${name} = $1 WHERE unit_id = $2`, [
        value,
        unitId,
      ])
    },
    [db, row, unitId],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form onChange={onChange} row={row} autoFocusRef={autoFocusRef} />
      </div>
    </div>
  )
})
