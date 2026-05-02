import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createProjectQc } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/qcs/$projectQcId/'

export const Header = ({ autoFocusRef }) => {
  const { projectId, projectQcId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  const projectQcIdRef = useRef(projectQcId)
  useEffect(() => {
    projectQcIdRef.current = projectQcId
  }, [projectQcId])

  const addRow = async () => {
    const id = await createProjectQc({ projectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, projectQcId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM project_qcs WHERE project_qc_id = $1`,
        [projectQcId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM project_qcs WHERE project_qc_id = $1`, [
        projectQcId,
      ])
      addOperation({
        table: 'project_qcs',
        rowIdName: 'project_qc_id',
        rowId: projectQcId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting project qc:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT project_qc_id
         FROM project_qcs
         WHERE project_id = $1
         ORDER BY COALESCE(NULLIF(label_de, ''), name, project_qc_id)`,
        [projectId],
      )
      const rows = res?.rows ?? []
      const len = rows.length
      if (!len) return
      const index = rows.findIndex((p) => p.project_qc_id === projectQcIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({
        to: `../${next.project_qc_id}`,
        params: (prev) => ({ ...prev, projectQcId: next.project_qc_id }),
      })
    } catch (error) {
      console.error('Error navigating to next project qc:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT project_qc_id
         FROM project_qcs
         WHERE project_id = $1
         ORDER BY COALESCE(NULLIF(label_de, ''), name, project_qc_id)`,
        [projectId],
      )
      const rows = res?.rows ?? []
      const len = rows.length
      if (!len) return
      const index = rows.findIndex((p) => p.project_qc_id === projectQcIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `../${previous.project_qc_id}`,
        params: (prev) => ({ ...prev, projectQcId: previous.project_qc_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous project qc:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({
        id: 'qcs.nameSingular',
        defaultMessage: 'Qualitätskontrolle',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName={formatMessage({
        id: 'qcs.nameSingular',
        defaultMessage: 'Qualitätskontrolle',
      })}
    />
  )
}
