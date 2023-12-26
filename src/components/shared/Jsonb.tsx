// This is the component to render data contained in jsonb
// There will need to be a way to add/remove fields to the jsonb object
// 1. get fields list for this table
// 2. build own onChange to pass to the fields?
// 3. loop through fields
// 4. build input depending on field properties
import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { getValueFromChange } from '../../modules/getValueFromChange'

export const Jsonb = memo(({ table, idField, id, data }) => {
  const { project_id } = useParams()

  const { db } = useElectric()
  const { results: fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: table, project_id, deleted: false },
    }),
  )

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db[table].update({
        where: { [idField]: id },
        data: { [name]: value },
      })
    },
    [db, id, idField, table],
  )

  console.log('Jsonb, fields', { fields, table, idField, id, data })

  return null
})
