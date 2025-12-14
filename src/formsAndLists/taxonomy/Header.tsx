import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createTaxonomy } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const isForm =
    from === '/data/projects/$projectId_/taxonomies/$taxonomyId_/taxonomy'
  const { projectId, taxonomyId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createTaxonomy({ db, projectId })
    const taxonomy = res?.rows?.[0]
    navigate({
      to:
        isForm ?
          `../../${taxonomy.taxonomy_id}/taxonomy`
        : `../${taxonomy.taxonomy_id}/taxonomy`,
      params: (prev) => ({ ...prev, taxonomyId: taxonomy.taxonomy_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM taxonomies WHERE taxonomy_id = $1`, [taxonomyId])
    navigate({ to: isForm ? `../..` : `..` })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT taxonomy_id FROM taxonomies WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const taxonomies = res?.rows
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomyId)
    const next = taxonomies[(index + 1) % len]
    navigate({
      to:
        isForm ?
          `../../${next.taxonomy_id}/taxonomy`
        : `../${next.taxonomy_id}`,
      params: (prev) => ({ ...prev, taxonomyId: next.taxonomy_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT taxonomy_id FROM taxonomies WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const taxonomies = res?.rows
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomyId)
    const previous = taxonomies[(index + len - 1) % len]
    navigate({
      to:
        isForm ?
          `../../${previous.taxonomy_id}/taxonomy`
        : `../${previous.taxonomy_id}`,
      params: (prev) => ({ ...prev, taxonomyId: previous.taxonomy_id }),
    })
  }

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
}
