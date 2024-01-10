import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Taxa as Taxon } from '../../../generated/client'
import { createTaxon } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, taxonomy_id, taxon_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.taxa.liveUnique({ where: { taxon_id } }),
    [taxon_id],
  )

  const addRow = useCallback(async () => {
    const taxon = createTaxon()
    await db.taxa.create({
      data: { ...taxon, taxonomy_id },
    })
    navigate(
      `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${taxon.taxon_id}`,
    )
    autoFocusRef.current?.focus()
  }, [db.taxa, navigate, project_id, taxonomy_id])

  const deleteRow = useCallback(async () => {
    await db.taxa.delete({
      where: {
        taxon_id,
      },
    })
    navigate(`/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`)
  }, [db.taxa, navigate, project_id, taxon_id, taxonomy_id])

  const toNext = useCallback(async () => {
    const taxa = await db.taxa.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const next = taxa[(index + 1) % len]
    navigate(
      `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${next.taxon_id}`,
    )
  }, [db.taxa, navigate, project_id, taxon_id, taxonomy_id])

  const toPrevious = useCallback(async () => {
    const taxa = await db.taxa.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const previous = taxa[(index + len - 1) % len]
    navigate(
      `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa/${previous.taxon_id}`,
    )
  }, [db.taxa, navigate, project_id, taxon_id, taxonomy_id])

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
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="taxon"
      />
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
  )
}
