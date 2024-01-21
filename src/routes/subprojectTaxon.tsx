import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client'
import { createSubprojectTaxon } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { FilteringCombobox } from '../components/shared/FilteringCombobox'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, subproject_taxon_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.subproject_taxa.liveUnique({ where: { subproject_taxon_id } }),
    [subproject_taxon_id],
  )

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/taxa`

  const addRow = useCallback(async () => {
    const subprojectTaxon = createSubprojectTaxon()
    await db.subproject_taxa.create({
      data: { ...subprojectTaxon, subproject_id },
    })
    navigate(`${baseUrl}/${subprojectTaxon.subproject_taxon_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db.subproject_taxa, navigate, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.subproject_taxa.delete({
      where: { subproject_taxon_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.subproject_taxa, navigate, subproject_taxon_id])

  const toNext = useCallback(async () => {
    const subprojectTaxa = await db.subproject_taxa.findMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojectTaxa.length
    const index = subprojectTaxa.findIndex(
      (p) => p.subproject_taxon_id === subproject_taxon_id,
    )
    const next = subprojectTaxa[(index + 1) % len]
    navigate(`${baseUrl}/${next.subproject_taxon_id}`)
  }, [
    baseUrl,
    db.subproject_taxa,
    navigate,
    subproject_id,
    subproject_taxon_id,
  ])

  const toPrevious = useCallback(async () => {
    const subprojectTaxa = await db.subproject_taxa.findMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojectTaxa.length
    const index = subprojectTaxa.findIndex(
      (p) => p.subproject_taxon_id === subproject_taxon_id,
    )
    const previous = subprojectTaxa[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.subproject_taxon_id}`)
  }, [
    baseUrl,
    db.subproject_taxa,
    navigate,
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

  const taxaWhere = useMemo(() => ({ deleted: false }), [])

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="Subproject Taxon"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="subproject taxon"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="subproject_taxon_id"
          value={row.subproject_taxon_id}
        />
        <FilteringCombobox
          label="Taxon"
          name="taxon_id"
          table="taxa"
          where={taxaWhere}
          value={row.taxon_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
      </div>
    </div>
  )
}
