import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import {
  EyeRegular,
  PrintRegular,
  ArrowLeftRegular,
} from '@fluentui/react-icons'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createSubprojectReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom, languageAtom } from '../../store.ts'
import { subprojectNameSingularExpr } from '../../modules/subprojectNameCols.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { projectId, subprojectId, subprojectReportId } = useParams({
    from,
  })
  const navigate = useNavigate()
  const location = useLocation()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)

  const db = usePGlite()

  // Keep a ref to the current subprojectReportId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const subprojectReportIdRef = useRef(subprojectReportId)
  useEffect(() => {
    subprojectReportIdRef.current = subprojectReportId
  }, [subprojectReportId])

  const combinedRes = useLiveQuery(
    `SELECT
      p.${subprojectNameSingularExpr(language)} AS subproject_name_singular,
      (SELECT COUNT(*) FROM subproject_reports WHERE subproject_id = $1) AS count
    FROM projects p
    WHERE p.project_id = $2`,
    [subprojectId, projectId],
  )
  const subprojectNameSingular =
    combinedRes?.rows?.[0]?.subproject_name_singular
  const rowCount = combinedRes?.rows?.[0]?.count ?? 2
  const basePath = `/data/projects/${projectId}/subprojects/${subprojectId}/reports/${subprojectReportId}`

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
        `SELECT subproject_report_id FROM subproject_reports WHERE subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const subprojectReports = res?.rows
      const len = subprojectReports.length
      const index = subprojectReports.findIndex(
        (p) => p.subproject_report_id === subprojectReportIdRef.current,
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
        `SELECT subproject_report_id FROM subproject_reports WHERE subproject_id = $1 ORDER BY label`,
        [subprojectId],
      )
      const subprojectReports = res?.rows
      const len = subprojectReports.length
      const index = subprojectReports.findIndex(
        (p) => p.subproject_report_id === subprojectReportIdRef.current,
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

  const siblings = isPrintView ? (
    <>
      <Button
        icon={<ArrowLeftRegular />}
        onClick={onClickBack}
        title={formatMessage({
          id: 'bB3EfG',
          defaultMessage: 'Zurück zum Bericht',
        })}
      />
      <Button
        icon={<PrintRegular />}
        onClick={onClickPrint}
        title={formatMessage({ id: 'bB5IjK', defaultMessage: 'Drucken' })}
      />
    </>
  ) : (
    <>
      <HistoryToggleButton
        historiesPath={`${basePath}/histories`}
        formPath={basePath}
        historyTable="subproject_reports_history"
        rowIdField="subproject_report_id"
        rowId={subprojectReportId}
      />
      <Button
        icon={<EyeRegular />}
        onClick={onClickPdf}
        title={formatMessage({
          id: 'bB2DeF',
          defaultMessage: 'Bericht-Vorschau',
        })}
      />
    </>
  )

  const title = isPrintView
    ? subprojectNameSingular
      ? `${subprojectNameSingular}-${formatMessage({ id: 'bCGhIj', defaultMessage: 'Bericht Druckvorschau' })}`
      : formatMessage({
          id: 'bCHiJk',
          defaultMessage: 'Teilprojekt-Bericht Druckvorschau',
        })
    : subprojectNameSingular
      ? `${subprojectNameSingular}-${formatMessage({ id: 'bCFgHi', defaultMessage: 'Bericht' })}`
      : formatMessage({ id: 'OGDgRl', defaultMessage: 'Teilprojekt-Bericht' })

  return (
    <FormHeader
      title={title}
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
