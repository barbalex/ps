import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createCheckTaxon } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { check_id, check_taxon_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const checkTaxon = createCheckTaxon()
    await db.check_taxa.create({
      data: {
        ...checkTaxon,
        check_id,
      },
    })
    navigate(`../${checkTaxon.check_taxon_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, check_id, db.check_taxa, navigate])

  const deleteRow = useCallback(async () => {
    await db.check_taxa.delete({
      where: { check_taxon_id },
    })
    navigate('..')
  }, [check_taxon_id, db.check_taxa, navigate])

  const toNext = useCallback(async () => {
    const checkTaxa = await db.check_taxa.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const next = checkTaxa[(index + 1) % len]
    navigate(`../${next.check_taxon_id}`)
  }, [check_id, check_taxon_id, db.check_taxa, navigate])

  const toPrevious = useCallback(async () => {
    const checkTaxa = await db.check_taxa.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const previous = checkTaxa[(index + len - 1) % len]
    navigate(`../${previous.check_taxon_id}`)
  }, [check_id, check_taxon_id, db.check_taxa, navigate])

  return (
    <FormHeader
      title="Check taxon"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="check taxon"
    />
  )
})
