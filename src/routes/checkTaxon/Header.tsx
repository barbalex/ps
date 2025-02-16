import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCheckTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { check_id, check_taxon_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const checkTaxon = createCheckTaxon()
    const columns = Object.keys(checkTaxon).join(',')
    const values = Object.values(checkTaxon)
      .map((_, i) => `$${i + 1}`)
      .join(',')
    await db.query(
      `INSERT INTO check_taxa (${columns}, check_id) VALUES (${values}, ${
        Object.values(checkTaxon).length + 1
      })`,
      [...Object.values(checkTaxon), check_id],
    )
    navigate({
      pathname: `../${checkTaxon.check_taxon_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, check_id, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    db.query('DELETE FROM check_taxa WHERE check_taxon_id = $1', [
      check_taxon_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [check_taxon_id, db, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT check_taxon_id FROM check_taxa WHERE check_id = $1 ORDER BY label ASC',
      [check_id],
    )
    const checkTaxa = res.rows
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const next = checkTaxa[(index + 1) % len]
    navigate({
      pathname: `../${next.check_taxon_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, check_taxon_id, db, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT check_taxon_id FROM check_taxa WHERE check_id = $1 ORDER BY label ASC',
      [check_id],
    )
    const checkTaxa = res.rows
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const previous = checkTaxa[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.check_taxon_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, check_taxon_id, db, navigate, searchParams])

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
