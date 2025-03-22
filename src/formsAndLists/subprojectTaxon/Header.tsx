import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId/'

export const Header = memo(({ autoFocusRef }) => {
  const { subprojectId, subprojectTaxonId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createSubprojectTaxon({ db, subprojectId })
    const subprojectTaxon = res?.rows?.[0]
    navigate({
      to: `../${subprojectTaxon.subproject_taxon_id}`,
      params: (prev) => ({
        ...prev,
        subprojectTaxonId: subprojectTaxon.subproject_taxon_id,
      }),
    })
    autoFocusRef.current?.focus()
  }, [db, subprojectId, navigate, autoFocusRef])

  const deleteRow = useCallback(async () => {
    await db.query(
      `DELETE FROM subproject_taxa WHERE subproject_taxon_id = $1`,
      [subprojectTaxonId],
    )
    navigate({ to: '..' })
  }, [db, subprojectTaxonId, navigate])

  const toNext = useCallback(async () => {
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
  }, [db, subprojectId, navigate, subprojectTaxonId])

  const toPrevious = useCallback(async () => {
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
  }, [db, navigate, subprojectId, subprojectTaxonId])

  return (
    <FormHeader
      title="Subproject Taxon"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="subproject taxon"
    />
  )
})
