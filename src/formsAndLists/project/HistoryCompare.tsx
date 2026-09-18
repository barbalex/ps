import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import type { InputOnChangeData } from '@fluentui/react-components'

import { ProjectForm } from './Form.tsx'
import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type ProjectsHistory from '../../models/public/ProjectsHistory.ts'

export const ProjectHistoryCompare = ({
  from,
}: {
  from: '/data/projects/$projectId_/histories/$projectHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const { projectId, projectHistoryId } = useParams({ strict: false })
  const projectPath = `/data/projects/${projectId}/project`
  const historyPath = `/data/projects/${projectId}/histories`
  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const rowRes = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const row = rowRes?.rows?.[0] as Record<string, unknown> | undefined

  const visibleCurrentFields = new Set(['name', 'label', 'data'])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      label: { id: 'XlAbCd', defaultMessage: 'Bezeichnung' },
      data: { id: 'bDbEhF', defaultMessage: 'Daten' },
    },
  })

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data?: InputOnChangeData,
  ) => {
    const { name, value } = getValueFromChange(e, data!)
    if (!row || (row as Record<string, unknown>)[name] === value) return

    try {
      await db.query(`UPDATE projects SET ${name} = $1 WHERE project_id = $2`, [
        value,
        projectId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: (error as Error).message },
      }))
      return
    }

    setValidations((prev) => {
       
      const { [name]: _unused, ...rest } = prev
      return rest
    })

    addOperation({
      table: 'projects',
      rowIdName: 'project_id',
      rowId: projectId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'fz2AhZ', defaultMessage: 'Projekt' })}
        id={projectId}
      />
    )
  }

  return (
    <HistoryCompare<ProjectsHistory & Record<string, unknown>>
      onBack={() => navigate({ to: projectPath })}
      leftContent={
        <div className="form-container">
          <ProjectForm
            row={row}
            onChange={onChange}
            validations={validations}
            autoFocusRef={autoFocusRef}
            from={from}
          />
        </div>
      }
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      row={row}
      historyConfig={{
        historyTable: 'projects_history',
        rowIdField: 'project_id',
        rowId: projectId,
        historyPath,
        routeHistoryId: projectHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'projects',
        rowIdName: 'project_id',
        rowId: projectId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
