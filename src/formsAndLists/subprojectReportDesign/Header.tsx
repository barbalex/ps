import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createSubprojectReportDesign } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const addOperation = useSetAtom(addOperationAtom)
  const { subprojectId, subprojectReportDesignId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM subproject_report_designs WHERE subproject_id = '${subprojectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const subproject_report_design_id = await createSubprojectReportDesign({
      subprojectId,
    })
    if (!subproject_report_design_id) return
    navigate({
      to: `../${subproject_report_design_id}`,
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM subproject_report_designs WHERE subproject_report_design_id = $1`,
      [subprojectReportDesignId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    await db.query(
      `DELETE FROM subproject_report_designs WHERE subproject_report_design_id = $1`,
      [subprojectReportDesignId],
    )
    addOperation({
      table: 'subproject_report_designs',
      rowIdName: 'subproject_report_design_id',
      rowId: subprojectReportDesignId,
      operation: 'delete',
      prev,
    })
    navigate({ to: `..` })
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `
          SELECT subproject_report_design_id 
          FROM subproject_report_designs 
          WHERE subproject_id = $1 
          ORDER BY label
        `,
        [subprojectId],
      )
      const designs = res?.rows
      const len = designs.length
      const index = designs.findIndex(
        (d) => d.subproject_report_design_id === subprojectReportDesignId,
      )
      if (index === -1 || index === len - 1) return
      const subproject_report_design_id =
        designs[index + 1].subproject_report_design_id
      navigate({
        to: `../${subproject_report_design_id}`,
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
          SELECT subproject_report_design_id 
          FROM subproject_report_designs 
          WHERE subproject_id = $1 
          ORDER BY label
        `,
        [subprojectId],
      )
      const designs = res?.rows
      const index = designs.findIndex(
        (d) => d.subproject_report_design_id === subprojectReportDesignId,
      )
      if (index === -1 || index === 0) return
      const subproject_report_design_id =
        designs[index - 1].subproject_report_design_id
      navigate({
        to: `../${subproject_report_design_id}`,
      })
      autoFocusRef?.current?.focus()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
    />
  )
}
