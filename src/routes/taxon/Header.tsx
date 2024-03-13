import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createTaxon } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { taxonomy_id, taxon_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const taxon = createTaxon()
    await db.taxa.create({ data: { ...taxon, taxonomy_id } })
    navigate(`../${taxon.taxon_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.taxa, navigate, taxonomy_id])

  const deleteRow = useCallback(async () => {
    await db.taxa.delete({ where: { taxon_id } })
    navigate('..')
  }, [db.taxa, navigate, taxon_id])

  const toNext = useCallback(async () => {
    const taxa = await db.taxa.findMany({
      where: { deleted: false, taxonomy_id },
      orderBy: { label: 'asc' },
    })
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const next = taxa[(index + 1) % len]
    navigate(`../${next.taxon_id}`)
  }, [db.taxa, navigate, taxon_id, taxonomy_id])

  const toPrevious = useCallback(async () => {
    const taxa = await db.taxa.findMany({
      where: { deleted: false, taxonomy_id },
      orderBy: { label: 'asc' },
    })
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const previous = taxa[(index + len - 1) % len]
    navigate(`../${previous.taxon_id}`)
  }, [db.taxa, navigate, taxon_id, taxonomy_id])

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
