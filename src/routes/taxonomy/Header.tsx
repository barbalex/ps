import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createTaxonomy } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, taxonomy_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createTaxonomy({ db, project_id })
    const taxonomy = res?.rows?.[0]
    navigate({
      pathname: `../${taxonomy.taxonomy_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM taxonomies WHERE taxonomy_id = $1`, [taxonomy_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, taxonomy_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT taxonomy_id FROM taxonomies WHERE project_id = $1 ORDER BY label`,
      [project_id],
    )
    const taxonomies = res?.rows
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomy_id)
    const next = taxonomies[(index + 1) % len]
    navigate({
      pathname: `../${next.taxonomy_id}`,
      search: searchParams.toString(),
    })
  }, [db, project_id, navigate, searchParams, taxonomy_id])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT taxonomy_id FROM taxonomies WHERE project_id = $1 ORDER BY label`,
      [project_id],
    )
    const taxonomies = res?.rows
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomy_id)
    const previous = taxonomies[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.taxonomy_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, taxonomy_id, searchParams])

  return (
    <FormHeader
      title="Taxonomy"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="taxonomy"
    />
  )
})
