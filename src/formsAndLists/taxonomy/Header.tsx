import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createTaxonomy } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef, from }) => {
  const { projectId, taxonomyId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createTaxonomy({ db, projectId })
    const taxonomy = res?.rows?.[0]
    navigate({
      to: `../${taxonomy.taxonomy_id}`,
      params: (prev) => ({ ...prev, taxonomyId: taxonomy.taxonomy_id }),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM taxonomies WHERE taxonomy_id = $1`, [taxonomyId])
    navigate({ to: '..' })
  }, [db, navigate, taxonomyId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT taxonomy_id FROM taxonomies WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const taxonomies = res?.rows
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomyId)
    const next = taxonomies[(index + 1) % len]
    navigate({
      to: `../${next.taxonomy_id}`,
      params: (prev) => ({ ...prev, taxonomyId: next.taxonomy_id }),
    })
  }, [db, projectId, navigate, taxonomyId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT taxonomy_id FROM taxonomies WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const taxonomies = res?.rows
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomyId)
    const previous = taxonomies[(index + len - 1) % len]
    navigate({
      to: `../${previous.taxonomy_id}`,
      params: (prev) => ({ ...prev, taxonomyId: previous.taxonomy_id }),
    })
  }, [db, navigate, projectId, taxonomyId])

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
