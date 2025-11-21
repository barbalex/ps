import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/$subprojectTaxonId/'

export const Header = ({ autoFocusRef }) => {
  const { subprojectId, subprojectTaxonId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createSubprojectTaxon({ db, subprojectId })
    const subprojectTaxon = res?.rows?.[0]
    navigate({
      to: `../${subprojectTaxon.subproject_taxon_id}`,
      params: (prev) => ({
        ...prev,
        subprojectTaxonId: subprojectTaxon.subproject_taxon_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM subproject_taxa WHERE subproject_taxon_id = $1`, [
      subprojectTaxonId,
    ])
    navigate({ to: '..' })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

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
}
