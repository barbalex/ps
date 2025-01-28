import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProject } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { DesigningButton } from './DesigningButton.tsx'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

// TODO: add button to enter design mode
// add this only if user's account equals the account of the project
export const Header = memo(({ autoFocusRef }) => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const data = await createProject({ db })
    await db.projects.create({ data })

    // TODO: add place_levels?
    // now navigate to the new project
    navigate({
      pathname: `../${data.project_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.projects.delete({
      where: { project_id },
    })
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db.projects, navigate, project_id, searchParams])

  const toNext = useCallback(async () => {
    const projects = await db.projects.findMany({
      orderBy: { label: 'asc' },
    })
    const len = projects.length
    const index = projects.findIndex((p) => p.project_id === project_id)
    const next = projects[(index + 1) % len]
    navigate({
      pathname: `../${next.project_id}`,
      search: searchParams.toString(),
    })
  }, [db.projects, navigate, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const projects = await db.projects.findMany({
      orderBy: { label: 'asc' },
    })
    const len = projects.length
    const index = projects.findIndex((p) => p.project_id === project_id)
    const previous = projects[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.project_id}`,
      search: searchParams.toString(),
    })
  }, [db.projects, navigate, project_id, searchParams])

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
