import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createSubprojectTaxon } from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { subproject_id, subproject_taxon_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const subprojectTaxon = createSubprojectTaxon()
    await db.subproject_taxa.create({
      data: { ...subprojectTaxon, subproject_id },
    })
    navigate({
      pathname: `../${subprojectTaxon.subproject_taxon_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.subproject_taxa, navigate, subproject_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.subproject_taxa.delete({ where: { subproject_taxon_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.subproject_taxa, navigate, subproject_taxon_id, searchParams])

  const toNext = useCallback(async () => {
    const subprojectTaxa = await db.subproject_taxa.findMany({
      where: {  subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojectTaxa.length
    const index = subprojectTaxa.findIndex(
      (p) => p.subproject_taxon_id === subproject_taxon_id,
    )
    const next = subprojectTaxa[(index + 1) % len]
    navigate({
      pathname: `../${next.subproject_taxon_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.subproject_taxa,
    navigate,
    subproject_id,
    subproject_taxon_id,
    searchParams,
  ])

  const toPrevious = useCallback(async () => {
    const subprojectTaxa = await db.subproject_taxa.findMany({
      where: {  subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojectTaxa.length
    const index = subprojectTaxa.findIndex(
      (p) => p.subproject_taxon_id === subproject_taxon_id,
    )
    const previous = subprojectTaxa[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.subproject_taxon_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.subproject_taxa,
    navigate,
    searchParams,
    subproject_id,
    subproject_taxon_id,
  ])

  return (
    <FormHeader
      title="Subproject Taxon"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="subproject taxon"
    />
  )
})
