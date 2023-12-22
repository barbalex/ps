import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { Field, RadioGroup, Radio, Switch } from '@fluentui/react-components'

import { Taxonomies as Taxonomy } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { taxonomy as createTaxonomyPreset } from '../modules/dataPresets'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
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
    const newTaxonomy = createTaxonomyPreset()
    await db.taxonomies.create({
      data: { ...newTaxonomy, project_id },
    })
    navigate(`/projects/${project_id}/taxonomies/${newTaxonomy.taxonomy_id}`)
  }, [db.taxonomies, navigate, project_id])

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
      <Field label="Type">
        <RadioGroup
          layout="horizontal"
          value={row.type ?? ''}
          name="type"
          onChange={onChange}
        >
          <Radio label="Species" value="species" />
          <Radio label="Biotope" value="biotope" />
        </RadioGroup>
      </Field>
      <TextField
        label="Url"
        name="url"
        type="url"
        value={row.url ?? ''}
        onChange={onChange}
      />
      <Switch
        label="Obsolete"
        name="obsolete"
        checked={row.obsolete ?? false}
        onChange={onChange}
      />
    </div>
  )
}
