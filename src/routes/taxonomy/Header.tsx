import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createTaxonomy } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, taxonomy_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const data = await createTaxonomy({ db, project_id })
    await db.taxonomies.create({ data })
    navigate({
      pathname: `../${data.taxonomy_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.taxonomies.delete({ where: { taxonomy_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.taxonomies, navigate, taxonomy_id, searchParams])

  const toNext = useCallback(async () => {
    const taxonomies = await db.taxonomies.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomy_id)
    const next = taxonomies[(index + 1) % len]
    navigate({
      pathname: `../${next.taxonomy_id}`,
      search: searchParams.toString(),
    })
  }, [db.taxonomies, navigate, project_id, taxonomy_id, searchParams])

  const toPrevious = useCallback(async () => {
    const taxonomies = await db.taxonomies.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomy_id)
    const previous = taxonomies[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.taxonomy_id}`,
      search: searchParams.toString(),
    })
  }, [db.taxonomies, navigate, project_id, taxonomy_id, searchParams])

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
