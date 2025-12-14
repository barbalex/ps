import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxa/$taxonId/'

export const Header = ({ autoFocusRef }) => {
  const { taxonomyId, taxonId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = createTaxon({ taxonomyId, db })
    const taxon = res?.rows?.[0]
    navigate({
      to: `../${taxon.taxon_id}`,
      params: (prev) => ({ ...prev, taxonId: taxon.taxon_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM taxa WHERE taxon_id = $1`, [taxonId])
    navigate({ to: '..' })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT taxon_id FROM taxa WHERE taxonomy_id = $1 ORDER BY label`,
      [taxonomyId],
    )
    const taxa = res?.rows
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxonId)
    const next = taxa[(index + 1) % len]
    navigate({
      to: `../${next.taxon_id}`,
      params: (prev) => ({ ...prev, taxonId: next.taxon_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT taxon_id FROM taxa WHERE taxonomy_id = $1 ORDER BY label`,
      [taxonomyId],
    )
    const taxa = res?.rows
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxonId)
    const previous = taxa[(index + len - 1) % len]
    navigate({
      to: `../${previous.taxon_id}`,
      params: (prev) => ({ ...prev, taxonId: previous.taxon_id }),
    })
  }

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
}
