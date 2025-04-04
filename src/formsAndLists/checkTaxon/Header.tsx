import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCheckTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef, from }) => {
  const { checkId, checkTaxonId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createCheckTaxon({ db, checkId })
    const checkTaxon = res?.rows?.[0]
    navigate({
      to: `../${checkTaxon.check_taxon_id}`,
      params: (prev) => ({ ...prev, checkTaxonId: checkTaxon.check_taxon_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, checkId, db, navigate])

  const deleteRow = useCallback(async () => {
    db.query('DELETE FROM check_taxa WHERE check_taxon_id = $1', [checkTaxonId])
    navigate({ to: '..' })
  }, [checkTaxonId, db, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT check_taxon_id FROM check_taxa WHERE check_id = $1 ORDER BY label',
      [checkId],
    )
    const checkTaxa = res?.rows
    const len = checkTaxa.length
    const index = checkTaxa.findIndex((p) => p.check_taxon_id === checkTaxonId)
    const next = checkTaxa[(index + 1) % len]
    navigate({
      to: `../${next.check_taxon_id}`,
      params: (prev) => ({ ...prev, checkTaxonId: next.check_taxon_id }),
    })
  }, [checkId, checkTaxonId, db, navigate])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT check_taxon_id FROM check_taxa WHERE check_id = $1 ORDER BY label',
      [checkId],
    )
    const checkTaxa = res?.rows
    const len = checkTaxa.length
    const index = checkTaxa.findIndex((p) => p.check_taxon_id === checkTaxonId)
    const previous = checkTaxa[(index + len - 1) % len]
    navigate({
      to: `../${previous.check_taxon_id}`,
      params: (prev) => ({ ...prev, checkTaxonId: previous.check_taxon_id }),
    })
  }, [checkId, checkTaxonId, db, navigate])

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
