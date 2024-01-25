import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Taxa as Taxon } from '../../../generated/client'
import { createTaxon } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, taxonomy_id, taxon_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(db.taxa.liveUnique({ where: { taxon_id } }))

  const baseUrl = `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`

  const addRow = useCallback(async () => {
    const taxon = createTaxon()
    await db.taxa.create({
      data: { ...taxon, taxonomy_id },
    })
    navigate(`${baseUrl}/${taxon.taxon_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db.taxa, navigate, taxonomy_id])

  const deleteRow = useCallback(async () => {
    await db.taxa.delete({
      where: { taxon_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.taxa, navigate, taxon_id])

  const toNext = useCallback(async () => {
    const taxa = await db.taxa.findMany({
      where: { deleted: false, taxonomy_id },
      orderBy: { label: 'asc' },
    })
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const next = taxa[(index + 1) % len]
    navigate(`${baseUrl}/${next.taxon_id}`)
  }, [baseUrl, db.taxa, navigate, taxon_id, taxonomy_id])

  const toPrevious = useCallback(async () => {
    const taxa = await db.taxa.findMany({
      where: { deleted: false, taxonomy_id },
      orderBy: { label: 'asc' },
    })
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const previous = taxa[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.taxon_id}`)
  }, [baseUrl, db.taxa, navigate, taxon_id, taxonomy_id])

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
    <div className="form-outer-container">
      <FormHeader
        title="Taxon"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="taxon"
      />
      <div className="form-container">
        <TextFieldInactive label="ID" name="taxon_id" value={row.taxon_id} />
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
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
    </div>
  )
}
