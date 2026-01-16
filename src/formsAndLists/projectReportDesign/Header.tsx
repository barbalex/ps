import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectReportDesign } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const addOperation = useSetAtom(addOperationAtom)
  const { projectId, projectReportDesignId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const project_report_design_id = await createProjectReportDesign({
      projectId,
    })
    if (!project_report_design_id) return
    navigate({
      to: `../${project_report_design_id}`,
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM project_report_designs WHERE project_report_design_id = $1`,
      [projectReportDesignId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    await db.query(
      `DELETE FROM project_report_designs WHERE project_report_design_id = $1`,
      [projectReportDesignId],
    )
    addOperation({
      table: 'project_report_designs',
      rowIdName: 'project_report_design_id',
      rowId: projectReportDesignId,
      operation: 'delete',
      prev,
    })
    navigate({ to: `..` })
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `
          SELECT project_report_design_id 
          FROM project_report_designs 
          WHERE project_id = $1 
          ORDER BY label
        `,
        [projectId],
      )
      const designs = res?.rows
      const len = designs.length
      const index = designs.findIndex(
        (d) => d.project_report_design_id === projectReportDesignId,
      )
      if (index === -1 || index === len - 1) return
      const project_report_design_id =
        designs[index + 1].project_report_design_id
      navigate({
        to: `../${project_report_design_id}`,
      })
      autoFocusRef?.current?.focus()
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `
          SELECT project_report_design_id 
          FROM project_report_designs 
          WHERE project_id = $1 
          ORDER BY label
        `,
        [projectId],
      )
      const designs = res?.rows
      const index = designs.findIndex(
        (d) => d.project_report_design_id === projectReportDesignId,
      )
      if (index === -1 || index === 0) return
      const project_report_design_id =
        designs[index - 1].project_report_design_id
      navigate({
        to: `../${project_report_design_id}`,
      })
      autoFocusRef?.current?.focus()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      tableName="Project Report Design"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
    />
  )
}
