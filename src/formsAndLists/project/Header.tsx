import { usePGlite } from '@electric-sql/pglite-react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'

import { createProject } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { DesigningButton } from './DesigningButton.tsx'
import { addOperationAtom } from '../../store.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

// TODO: add button to enter design mode
// add this only if user's account equals the account of the project
export const Header = ({ autoFocusRef, from, label }: Props) => {
  const isForm = from === '/data/projects/$projectId_/project/'
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createProject({ db })
    const data = res?.rows?.[0]

    // TODO: add place_levels?
    // now navigate to the new project
    navigate({
      to:
        isForm ?
          `../../${data.project_id}/project`
        : `../${data.project_id}/project`,
      params: { projectId: data.project_id },
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM projects WHERE project_id = $1`, [projectId])
    navigate({ to: isForm ? `../..` : `..` })
  }

  const toNext = async () => {
    const res = await db.query(`SELECT project_id FROM projects order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.project_id === projectId)
    const next = rows[(index + 1) % len]
    navigate({
      to: isForm ? `../../${next.project_id}/project` : `../${next.project_id}`,
      params: { projectId: next.project_id },
    })
  }

  const toPrevious = async () => {
    const res = await db.query(`SELECT project_id FROM projects order by label`)
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.project_id === projectId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to:
        isForm ?
          `../../${previous.project_id}/project`
        : `../${previous.project_id}`,
      params: { projectId: previous.project_id },
    })
  }

  return (
    <FormHeader
      title={label ?? 'Project'}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="project"
      siblings={<DesigningButton from={from} />}
    />
  )
}
