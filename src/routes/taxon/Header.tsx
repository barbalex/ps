import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createTaxon } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { taxonomy_id, taxon_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const taxon = createTaxon()
    await db.taxa.create({ data: { ...taxon, taxonomy_id } })
    navigate({
      pathname: `../${taxon.taxon_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.taxa, navigate, taxonomy_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.taxa.delete({ where: { taxon_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.taxa, navigate, taxon_id, searchParams])

  const toNext = useCallback(async () => {
    const taxa = await db.taxa.findMany({
      where: {  taxonomy_id },
      orderBy: { label: 'asc' },
    })
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const next = taxa[(index + 1) % len]
    navigate({
      pathname: `../${next.taxon_id}`,
      search: searchParams.toString(),
    })
  }, [db.taxa, navigate, taxon_id, taxonomy_id, searchParams])

  const toPrevious = useCallback(async () => {
    const taxa = await db.taxa.findMany({
      where: {  taxonomy_id },
      orderBy: { label: 'asc' },
    })
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const previous = taxa[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.taxon_id}`,
      search: searchParams.toString(),
    })
  }, [db.taxa, navigate, taxon_id, taxonomy_id, searchParams])

  return (
    <FormHeader
      title="Taxon"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="taxon"
    />
  )
})
