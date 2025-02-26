import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectTaxon } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { subproject_id, subproject_taxon_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createSubprojectTaxon({ db, subproject_id })
    const subprojectTaxon = res?.rows?.[0]
    navigate({
      pathname: `../${subprojectTaxon.subproject_taxon_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [db, subproject_id, navigate, searchParams, autoFocusRef])

  const deleteRow = useCallback(async () => {
    await db.query(
      `DELETE FROM subproject_taxa WHERE subproject_taxon_id = $1`,
      [subproject_taxon_id],
    )
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, subproject_taxon_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM subproject_taxa WHERE subproject_id = $1 order by label asc`,
      [subproject_id],
    )
    const subprojectTaxa = res?.rows
    const len = subprojectTaxa.length
    const index = subprojectTaxa.findIndex(
      (p) => p.subproject_taxon_id === subproject_taxon_id,
    )
    const next = subprojectTaxa[(index + 1) % len]
    navigate({
      pathname: `../${next.subproject_taxon_id}`,
      search: searchParams.toString(),
    })
  }, [db, subproject_id, navigate, searchParams, subproject_taxon_id])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM subproject_taxa WHERE subproject_id = $1 order by label asc`,
      [subproject_id],
    )
    const subprojectTaxa = res?.rows
    const len = subprojectTaxa.length
    const index = subprojectTaxa.findIndex(
      (p) => p.subproject_taxon_id === subproject_taxon_id,
    )
    const previous = subprojectTaxa[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.subproject_taxon_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, subproject_id, subproject_taxon_id])

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
