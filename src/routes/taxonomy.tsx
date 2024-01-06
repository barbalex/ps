import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Taxonomies as Taxonomy } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { taxonomy as createTaxonomy } from '../modules/createRows'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { SwitchField } from '../components/shared/SwitchField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, taxonomy_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.taxonomies.liveUnique({ where: { taxonomy_id } }),
    [taxonomy_id],
  )

  const addRow = useCallback(async () => {
    const data = await createTaxonomy({ db, project_id })
    await db.taxonomies.create({ data })
    navigate(`/projects/${project_id}/taxonomies/${data.taxonomy_id}`)
  }, [db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.taxonomies.delete({
      where: {
        taxonomy_id,
      },
    })
    navigate(`/projects/${project_id}/taxonomies`)
  }, [db.taxonomies, navigate, project_id, taxonomy_id])

  const row: Taxonomy = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.taxonomies.update({
        where: { taxonomy_id },
        data: { [name]: value },
      })
    },
    [db.taxonomies, taxonomy_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="taxonomy" />
      <TextFieldInactive
        label="ID"
        name="taxonomy_id"
        value={row.taxonomy_id}
      />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <RadioGroupField
        label="Type"
        name="type"
        list={['species', 'biotope']}
        value={row.type ?? ''}
        onChange={onChange}
      />
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
  )
}
