import { memo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'

import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(() => {
  const { crs_id } = useParams()

  const db = usePGlite()
  const result = useLiveIncrementalQuery(
    `SELECT * FROM crs WHERE crs_id = $1`,
    [crs_id],
    'crs_id',
  )
  const row = result?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(`UPDATE crs SET ${name} = $1 WHERE crs_id = $2`, [value, crs_id])
    },
    [row, db, crs_id],
  )

  if (!row) return <Loading />

  return (
    <>
      <TextField
        label="Code"
        name="code"
        type="code"
        value={row.code ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Name"
        name="name"
        type="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <TextArea
        label="Proj4 Value"
        name="proj4"
        type="proj4"
        value={row.proj4 ?? ''}
        onChange={onChange}
      />
    </>
  )
})
