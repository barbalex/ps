import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client'
import { subprojectTaxon as createSubprojectTaxonPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, subproject_taxon_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.subproject_taxa.liveUnique({ where: { subproject_taxon_id } }),
    [subproject_taxon_id],
  )

  const addRow = useCallback(async () => {
    const newSubprojectTaxon = createSubprojectTaxonPreset()
    await db.subproject_taxa.create({
      data: { ...newSubprojectTaxon, subproject_id },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/taxa/${newSubprojectTaxon.subproject_taxon_id}`,
    )
  }, [db.subproject_taxa, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.subproject_taxa.delete({
      where: {
        subproject_taxon_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/taxa`)
  }, [
    db.subproject_taxa,
    navigate,
    project_id,
    subproject_id,
    subproject_taxon_id,
  ])

  const row: SubprojectTaxon = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subproject_taxa.update({
        where: { subproject_taxon_id },
        data: { [name]: value },
      })
    },
    [db.subproject_taxa, subproject_taxon_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="project user"
      />
      <TextFieldInactive
        label="ID"
        name="subproject_taxon_id"
        value={row.subproject_taxon_id}
      />
      <TextField
        label="Taxon ID"
        name="taxon_id"
        value={row.taxon_id ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
