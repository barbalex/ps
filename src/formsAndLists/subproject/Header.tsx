import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubproject } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = ({ autoFocusRef, nameSingular = 'Subproject', from }) => {
  const isForm =
    from === '/data/projects/$projectId_/subprojects/$subprojectId_/subproject'
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const nameSingularLower = nameSingular?.toLowerCase?.()

  const addRow = async () => {
    const res = await createSubproject({ db, projectId })
    const data = res?.rows?.[0]
    navigate({
      to:
        isForm ?
          `../../${data.subproject_id}/subproject`
        : `../${data.subproject_id}/subproject`,
      params: (prev) => ({
        ...prev,
        subprojectId: data.subproject_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM subprojects WHERE subproject_id = $1`, [subprojectId])
    navigate({ to: isForm ? `../..` : `..` })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT subproject_id FROM subprojects WHERE project_id = $1 order by label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.subproject_id === subprojectId)
    const next = rows[(index + 1) % len]
    navigate({
      to:
        isForm ?
          `../../${next.subproject_id}/subproject`
        : `../${next.subproject_id}`,
      params: (prev) => ({
        ...prev,
        subprojectId: next.subproject_id,
      }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT subproject_id FROM subprojects WHERE project_id = $1 order by label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.subproject_id === subprojectId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to:
        isForm ?
          `../../${previous.subproject_id}/subproject`
        : `../${previous.subproject_id}`,
      params: (prev) => ({
        ...prev,
        subprojectId: previous.subproject_id,
      }),
    })
  }

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
}
