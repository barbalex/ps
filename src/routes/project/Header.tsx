import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProject } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { DesigningButton } from './DesigningButton.tsx'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

// TODO: add button to enter design mode
// add this only if user's account equals the account of the project
export const Header = memo(({ autoFocusRef }: Props) => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createProject({ db })
    const data = res?.rows?.[0]

    // TODO: add place_levels?
    // now navigate to the new project
    navigate({
      pathname: `../${data.project_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM projects WHERE project_id = $1`, [project_id])
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db, navigate, project_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(`SELECT project_id FROM projects order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.project_id === project_id)
    const next = rows[(index + 1) % len]
    navigate({
      pathname: `../${next.project_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(`SELECT project_id FROM projects order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.project_id === project_id)
    const previous = rows[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.project_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <FormHeader
      title="Project"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="project"
      siblings={<DesigningButton />}
    />
  )
})
