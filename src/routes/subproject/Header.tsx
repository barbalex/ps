import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubproject } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef, nameSingular = 'Subproject' }) => {
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const nameSingularLower = nameSingular?.toLowerCase?.()

  const addRow = useCallback(async () => {
    const res = await createSubproject({ db, project_id })
    const data = res.rows[0]
    navigate({
      pathname: `../${data.subproject_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.queries(`DELETE FROM subprojects WHERE subproject_id = $1`, [
      subproject_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, subproject_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM subprojects WHERE project_id = $1 order by label asc`,
      [project_id],
    )
    const subprojects = result.rows
    const len = subprojects.length
    const index = subprojects.findIndex(
      (p) => p.subproject_id === subproject_id,
    )
    const next = subprojects[(index + 1) % len]
    navigate({
      pathname: `../${next.subproject_id}`,
      search: searchParams.toString(),
    })
  }, [db, project_id, navigate, searchParams, subproject_id])

  const toPrevious = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM subprojects WHERE project_id = $1 order by label asc`,
      [project_id],
    )
    const subprojects = result.rows
    const len = subprojects.length
    const index = subprojects.findIndex(
      (p) => p.subproject_id === subproject_id,
    )
    const previous = subprojects[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.subproject_id}`,
      search: searchParams.toString(),
    })
  }, [db, project_id, navigate, searchParams, subproject_id])

  return (
    <FormHeader
      title={nameSingular}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName={nameSingularLower}
    />
  )
})
