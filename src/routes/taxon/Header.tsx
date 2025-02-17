import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { taxonomy_id, taxon_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = createTaxon({ taxonomy_id, db })
    const taxon = res.rows[0]
    navigate({
      pathname: `../${taxon.taxon_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, taxonomy_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM taxa WHERE taxon_id = $1`, [taxon_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, taxon_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT taxon_id FROM taxa WHERE taxonomy_id = $1 ORDER BY label ASC`,
      [taxonomy_id],
    )
    const taxa = res.rows
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const next = taxa[(index + 1) % len]
    navigate({
      pathname: `../${next.taxon_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, taxon_id, taxonomy_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT taxon_id FROM taxa WHERE taxonomy_id = $1 ORDER BY label ASC`,
      [taxonomy_id],
    )
    const taxa = res.rows
    const len = taxa.length
    const index = taxa.findIndex((p) => p.taxon_id === taxon_id)
    const previous = taxa[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.taxon_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, taxon_id, taxonomy_id, searchParams])

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
