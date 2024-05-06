import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createCheckTaxon } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { check_id, check_taxon_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const checkTaxon = createCheckTaxon()
    await db.check_taxa.create({
      data: {
        ...checkTaxon,
        check_id,
      },
    })
    navigate({
      pathname: `../${checkTaxon.check_taxon_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, check_id, db.check_taxa, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.check_taxa.delete({
      where: { check_taxon_id },
    })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [check_taxon_id, db.check_taxa, navigate, searchParams])

  const toNext = useCallback(async () => {
    const checkTaxa = await db.check_taxa.findMany({
      where: {  check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const next = checkTaxa[(index + 1) % len]
    navigate({
      pathname: `../${next.check_taxon_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, check_taxon_id, db.check_taxa, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const checkTaxa = await db.check_taxa.findMany({
      where: {  check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const previous = checkTaxa[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.check_taxon_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, check_taxon_id, db.check_taxa, navigate, searchParams])

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
