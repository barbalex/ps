import { memo, useCallback } from 'react'
import { useParams } from '@tanstack/react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

const from = '/data/crs/$crsId'

// this form is rendered from a parent or outlet
export const Component = memo(() => {
  const { crsId } = useParams({ from })

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT * FROM crs WHERE crs_id = $1`,
    [crsId],
    'crs_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(`UPDATE crs SET ${name} = $1 WHERE crs_id = $2`, [value, crsId])
    },
    [row, db, crsId],
  )

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="CRS"
        id={crsId}
      />
    )
  }

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
