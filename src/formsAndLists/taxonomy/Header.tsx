import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

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

  // Keep a ref to the current taxonomyId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const taxonomyIdRef = useRef(taxonomyId)
  useEffect(() => {
    taxonomyIdRef.current = taxonomyId
  }, [taxonomyId])

  const addRow = async () => {
    const id = await createTaxonomy({ projectId })
    if (!id) return
    navigate({
      to: isForm ? `../../${id}/taxonomy` : `../${id}/taxonomy`,
      params: (prev) => ({ ...prev, taxonomyId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM taxonomies WHERE taxonomy_id = $1`,
        [taxonomyId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM taxonomies WHERE taxonomy_id = $1`, [
        taxonomyId,
      ])
      addOperation({
        table: 'taxonomies',
        rowIdName: 'taxonomy_id',
        rowId: taxonomyId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error('Error deleting taxonomy:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT taxonomy_id FROM taxonomies WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const taxonomies = res?.rows
      const len = taxonomies.length
      const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomyIdRef.current)
      const next = taxonomies[(index + 1) % len]
      navigate({
        to: isForm
          ? `../../${next.taxonomy_id}/taxonomy`
          : `../${next.taxonomy_id}`,
        params: (prev) => ({ ...prev, taxonomyId: next.taxonomy_id }),
      })
    } catch (error) {
      console.error('Error navigating to next taxonomy:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT taxonomy_id FROM taxonomies WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const taxonomies = res?.rows
      const len = taxonomies.length
      const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomyIdRef.current)
      const previous = taxonomies[(index + len - 1) % len]
      navigate({
        to: isForm
          ? `../../${previous.taxonomy_id}/taxonomy`
          : `../${previous.taxonomy_id}`,
        params: (prev) => ({ ...prev, taxonomyId: previous.taxonomy_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous taxonomy:', error)
    }
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
