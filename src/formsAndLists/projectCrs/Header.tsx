import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createProjectCrs } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/crs/$projectCrsId/'

export const Header = ({ autoFocusRef }) => {
  const { projectId, projectCrsId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createProjectCrs({ projectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, projectCrsId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM project_crs WHERE project_crs_id = $1`,
        [projectId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      db.query(`DELETE FROM project_crs WHERE project_crs_id = $1`, [
        projectCrsId,
      ])
      addOperation({
        table: 'project_crs',
        rowIdName: 'project_crs_id',
        rowId: projectCrsId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT project_crs_id FROM project_crs WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const projectCrs = res?.rows
      const len = projectCrs.length
      const index = projectCrs.findIndex((p) => p.project_crs_id === projectCrsId)
      const next = projectCrs[(index + 1) % len]
      navigate({
        to: `../${next.project_crs_id}`,
        params: (prev) => ({ ...prev, projectCrsId: next.project_crs_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT project_crs_id FROM project_crs WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const projectCrs = res?.rows
      const len = projectCrs.length
      const index = projectCrs.findIndex((p) => p.project_crs_id === projectCrsId)
      const previous = projectCrs[(index + len - 1) % len]
      navigate({
        to: `../${previous.project_crs_id}`,
        params: (prev) => ({ ...prev, projectCrsId: previous.project_crs_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title="CRS"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="project_crs"
    />
  )
}
