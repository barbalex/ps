import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createTaxon } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, taxonomy_id, taxon_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `/projects/${project_id}/taxonomies/${taxonomy_id}/taxa`

  const addRow = useCallback(async () => {
    const taxon = createTaxon()
    await db.taxa.create({
      data: { ...taxon, taxonomy_id },
    })
    navigate(`${baseUrl}/${taxon.taxon_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db.taxa, navigate, taxonomy_id])

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
