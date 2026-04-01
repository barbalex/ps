import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom, useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createSubprojectReportDesign } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom, languageAtom } from '../../store.ts'
import { subprojectNameSingularExpr } from '../../modules/subprojectNameCols.ts'

export const Header = ({ autoFocusRef, from }) => {
  const addOperation = useSetAtom(addOperationAtom)
  const { projectId, subprojectReportDesignId } = useParams({ from })
  const basePath = `/data/projects/${projectId}/subproject-designs/${subprojectReportDesignId}`
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)

  const db = usePGlite()

  const projectRes = useLiveQuery(
    `SELECT ${subprojectNameSingularExpr(language)} AS subproject_name_singular FROM projects WHERE project_id = '${projectId}'`,
  )
  const subprojectNameSingular = projectRes?.rows?.[0]?.subproject_name_singular
  const title = subprojectNameSingular
    ? `${subprojectNameSingular}-${formatMessage({ id: 'bCEhIj', defaultMessage: 'Bericht Design' })}`
    : formatMessage({
        id: 'bCBeFg',
        defaultMessage: 'Subprojekt-Bericht Design',
      })

  // Keep a ref to the current subprojectReportDesignId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const subprojectReportDesignIdRef = useRef(subprojectReportDesignId)
  useEffect(() => {
    subprojectReportDesignIdRef.current = subprojectReportDesignId
  }, [subprojectReportDesignId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM subproject_report_designs WHERE project_id = '${projectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const subproject_report_design_id = await createSubprojectReportDesign({
      projectId,
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
          WHERE project_id = $1 
          ORDER BY label
        `,
        [projectId],
      )
      const designs = res?.rows
      const len = designs.length
      const index = designs.findIndex(
        (d) =>
          d.subproject_report_design_id === subprojectReportDesignIdRef.current,
      )
      const next = designs[(index + 1) % len]
      const subproject_report_design_id = next.subproject_report_design_id
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
          WHERE project_id = $1 
          ORDER BY label
        `,
        [projectId],
      )
      const designs = res?.rows
      const len = designs.length
      const index = designs.findIndex(
        (d) =>
          d.subproject_report_design_id === subprojectReportDesignIdRef.current,
      )
      const previous = designs[(index + len - 1) % len]
      const subproject_report_design_id = previous.subproject_report_design_id
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
      title={title}
      tableName="Subproject Report Design"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="subproject_report_designs_history"
          rowIdField="subproject_report_design_id"
          rowId={subprojectReportDesignId}
        />
      }
    />
  )
}
