import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { Button } from '@fluentui/react-components'
import {
  EyeRegular,
  PrintRegular,
  ArrowLeftRegular,
} from '@fluentui/react-icons'

import { createSubprojectReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { projectId, subprojectId, subprojectReportId } = useParams({
    from,
  })
  const navigate = useNavigate()
  const location = useLocation()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM subproject_reports WHERE project_id = '${projectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const isPrintView = location.pathname.endsWith('/print')

  const onClickPdf = () => {
    navigate({
      to: './print',
      params: (prev) => prev,
    })
  }

  const onClickPrint = () => {
    window.print()
  }

  const onClickBack = () => {
    navigate({
      to: '..',
      params: (prev) => prev,
    })
  }

  const addRow = async () => {
    const id = await createSubprojectReport({ projectId, subprojectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        subprojectReportId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM subproject_reports WHERE subproject_report_id = $1`,
        [subprojectReportId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        `DELETE FROM subproject_reports WHERE subproject_report_id = $1`,
        [subprojectReportId],
      )
      addOperation({
        table: 'subproject_reports',
        rowIdName: 'subproject_report_id',
        rowId: subprojectReportId,
        operation: 'delete',
        prev,
      })
      navigate({ to: `..` })
    } catch (error) {
      console.error('Error deleting subproject report:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_report_id FROM subproject_reports WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const subprojectReports = res?.rows
      const len = subprojectReports.length
      const index = subprojectReports.findIndex(
        (p) => p.subproject_report_id === subprojectReportId,
      )
      const next = subprojectReports[(index + 1) % len]
      navigate({
        to: `../${next.subproject_report_id}`,
        params: (prev) => ({
          ...prev,
          subprojectReportId: next.subproject_report_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next subproject report:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT subproject_report_id FROM subproject_reports WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const subprojectReports = res?.rows
      const len = subprojectReports.length
      const index = subprojectReports.findIndex(
        (p) => p.subproject_report_id === subprojectReportId,
      )
      const previous = subprojectReports[(index + len - 1) % len]
      navigate({
        to: `../${previous.subproject_report_id}`,
        params: (prev) => ({
          ...prev,
          subprojectReportId: previous.subproject_report_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous subproject report:', error)
    }
  }

  const siblings =
    isPrintView ?
      <>
        <Button
          icon={<ArrowLeftRegular />}
          onClick={onClickBack}
          title="Back to report"
        />
        <Button
          icon={<PrintRegular />}
          onClick={onClickPrint}
          title="Print"
        />
      </>
    : <Button
        icon={<EyeRegular />}
        onClick={onClickPdf}
        title="Preview report"
      />

  return (
    <FormHeader
      title={
        isPrintView ? 'Subproject Report Print Preview' : 'Subproject Report'
      }
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="subproject report"
      siblings={siblings}
    />
  )
}
