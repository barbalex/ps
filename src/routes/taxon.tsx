import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Taxa as Taxon } from '../../../generated/client'
import { taxon as createTaxonPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { taxonomy_id, taxon_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.taxa.liveUnique({ where: { taxon_id } }),
    [taxon_id],
  )

  const addRow = useCallback(async () => {
    const newTaxon = createTaxonPreset()
    await db.taxa.create({
      data: { ...newTaxon, project_id },
    })
    navigate(
      `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${newTaxon.taxon_id}`,
    )
  }, [db.taxa, navigate, taxonomy_id])

  const deleteRow = useCallback(async () => {
    await db.taxa.delete({
      where: {
        taxon_id,
      },
    })
    navigate(`/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`)
  }, [db.taxa, navigate, taxon_id, taxonomy_id])

  const row: Taxon = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.taxa.update({
        where: { taxon_id },
        data: { [name]: value },
      })
    },
    [db.taxa, taxon_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="taxon" />
      <TextFieldInactive label="ID" name="taxon_id" value={row.taxon_id} />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
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
  )
}
