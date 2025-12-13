import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createCheckTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { checkId, checkTaxonId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createCheckTaxon({ db, checkId })
    const checkTaxon = res?.rows?.[0]
    navigate({
      to: `../${checkTaxon.check_taxon_id}`,
      params: (prev) => ({ ...prev, checkTaxonId: checkTaxon.check_taxon_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query('DELETE FROM check_taxa WHERE check_taxon_id = $1', [checkTaxonId])
    navigate({ to: '..' })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

  return (
    <FormHeader
      title="Check Taxon"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="check taxon"
    />
  )
}
