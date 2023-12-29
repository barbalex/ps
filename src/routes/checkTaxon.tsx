import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { CheckTaxa as CheckTaxon } from '../../../generated/client'
import { checkTaxon as createCheckTaxonPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { DropdownField } from '../components/shared/DropdownField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, check_id, check_taxon_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.check_taxa.liveUnique({ where: { check_taxon_id } }),
    [check_taxon_id],
  )

  const addRow = useCallback(async () => {
    const newCheckTaxon = createCheckTaxonPreset()
    await db.check_taxa.create({
      data: {
        ...newCheckTaxon,
        check_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/taxa/${newCheckTaxon.check_taxon_id}`,
    )
  }, [check_id, db.check_taxa, navigate, place_id, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.check_taxa.delete({
      where: {
        check_taxon_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/taxa`,
    )
  }, [check_id, check_taxon_id, db.check_taxa, navigate, place_id, project_id, subproject_id])

  const row: CheckTaxon = results

  const taxaWhere = useMemo(() => ({ deleted: false }), [])


  // console.log('CheckTaxon', { row, results })

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.check_taxa.update({
        where: { check_taxon_id },
        data: { [name]: value },
      })
    },
    [db.check_taxa, check_taxon_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="goal report value"
      />
      <TextFieldInactive
        label="ID"
        name="check_taxon_id"
        value={row.check_taxon_id ?? ''}
      />
      <DropdownField
        label="Taxon"
        name="taxon_id"
        table="taxa"
        where={taxaWhere}
        value={row.taxon_id ?? ''}
        onChange={onChange}
        autoFocus 
      />
      <TextField
        label="Value (integer)"
        name="value_integer"
        type="number"
        value={row.value_integer ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Value (numeric)"
        name="value_numeric"
        type="number"
        value={row.value_numeric ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Value (text)"
        name="value_text"
        value={row.value_text ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
