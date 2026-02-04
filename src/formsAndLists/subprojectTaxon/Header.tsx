import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createSubprojectTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId/'

export const Header = ({ autoFocusRef }) => {
  const { subprojectId, subprojectTaxonId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM subproject_taxa WHERE subproject_id = '${subprojectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createSubprojectTaxon({ subprojectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        subprojectTaxonId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM subproject_taxa WHERE subproject_taxon_id = $1`,
        [subprojectTaxonId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM subproject_taxa WHERE subproject_taxon_id = $1`, [
        subprojectTaxonId,
      ])
      addOperation({
        table: 'subproject_taxa',
        rowIdName: 'subproject_taxon_id',
        rowId: subprojectTaxonId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting subproject taxon:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_taxon_id FROM subproject_taxa WHERE subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const subprojectTaxa = res?.rows
      const len = subprojectTaxa.length
      const index = subprojectTaxa.findIndex(
        (p) => p.subproject_taxon_id === subprojectTaxonId,
      )
      const next = subprojectTaxa[(index + 1) % len]
      navigate({
        to: `../${next.subproject_taxon_id}`,
        params: (prev) => ({
          ...prev,
          subprojectTaxonId: next.subproject_taxon_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next subproject taxon:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_taxon_id FROM subproject_taxa WHERE subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const subprojectTaxa = res?.rows
      const len = subprojectTaxa.length
      const index = subprojectTaxa.findIndex(
        (p) => p.subproject_taxon_id === subprojectTaxonId,
      )
      const previous = subprojectTaxa[(index + len - 1) % len]
      navigate({
        to: `../${previous.subproject_taxon_id}`,
        params: (prev) => ({
          ...prev,
          subprojectTaxonId: previous.subproject_taxon_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous subproject taxon:', error)
    }
  }

  return (
    <FormHeader
      title="Subproject Taxon"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="subproject taxon"
    />
  )
}
