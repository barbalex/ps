import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import {
  EyeRegular,
  PrintRegular,
  ArrowLeftRegular,
} from '@fluentui/react-icons'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createProjectReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { projectId, projectReportId } = useParams({ from })
  const navigate = useNavigate()
  const location = useLocation()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const isPrintView = location.pathname.endsWith('/print')

  const onClickPdf = () =>
    navigate({
      to: './print',
      params: (prev) => prev,
    })

  const onClickPrint = () => window.print()

  const onClickBack = () =>
    navigate({
      to: '..',
      params: (prev) => prev,
    })

  const db = usePGlite()

  // Keep a ref to the current projectReportId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const projectReportIdRef = useRef(projectReportId)
  useEffect(() => {
    projectReportIdRef.current = projectReportId
  }, [projectReportId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM project_reports WHERE project_id = '${projectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createProjectReport({ projectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        projectReportId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM project_reports WHERE project_report_id = $1`,
        [projectReportId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        `DELETE FROM project_reports WHERE project_report_id = $1`,
        [projectReportId],
      )
      addOperation({
        table: 'project_reports',
        rowIdName: 'project_report_id',
        rowId: projectReportId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting project report:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT project_report_id FROM project_reports WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.project_report_id === projectReportIdRef.current,
      )
      const next = rows[(index + 1) % len]
      navigate({
        to: `../${next.project_report_id}`,
        params: (prev) => ({
          ...prev,
          projectReportId: next.project_report_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT project_report_id FROM project_reports WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.project_report_id === projectReportIdRef.current,
      )
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `../${previous.project_report_id}`,
        params: (prev) => ({
          ...prev,
          projectReportId: previous.project_report_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const siblings = isPrintView ? (
    <>
      <Button
        icon={<ArrowLeftRegular />}
        onClick={onClickBack}
        title={formatMessage({ id: 'bB3EfG', defaultMessage: 'Zum Bericht zurück' })}
      />
      <Button icon={<PrintRegular />} onClick={onClickPrint} title={formatMessage({ id: 'bB5IjK', defaultMessage: 'Drucken' })} />
    </>
  ) : (
    <Button icon={<EyeRegular />} onClick={onClickPdf} title={formatMessage({ id: 'bB2DeF', defaultMessage: 'Bericht-Vorschau' })} />
  )

  return (
    <FormHeader
      title={isPrintView ? formatMessage({ id: 'bB1CdE', defaultMessage: 'Projekt-Bericht Druckvorschau' }) : formatMessage({ id: 'bB0++E', defaultMessage: 'Projekt-Bericht' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="project report"
      siblings={siblings}
    />
  )
}
