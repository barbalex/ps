import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import * as XLSX from '@e965/xlsx'

import { Loading } from '../components/shared/Loading.tsx'
import {
  languageAtom,
  projectExportsRunLabelFilterAtom,
  projectExportsRunFilteredCountAtom,
} from '../store.ts'
import { Dismiss16Regular } from '@fluentui/react-icons'
import { useProjectExportsRunNavData } from '../modules/useProjectExportsRunNavData.ts'
import styles from './projectExportsRun.module.css'

import '../form.css'

const { Button, Input, Field, Text } = fluentUiReactComponents

type ExportRow = {
  exports_id: string
  label: string | null
  sql: string | null
}

type ExportFormat = 'csv' | 'xlsx' | 'ods'

/** Highlight all occurrences of `term` in `text` */
function HighlightedLabel({
  text,
  term,
}: {
  text: string
  term: string
}): React.ReactElement {
  if (!term.trim()) return <span>{text}</span>
  const regex = new RegExp(
    `(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  )
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}

async function runAndDownload({
  db,
  sql,
  year,
  label,
  format,
}: {
  db: ReturnType<typeof usePGlite>
  sql: string
  year: string
  label: string
  format: ExportFormat
}) {
  const params: (string | number)[] = []
  if (sql.includes('$1')) {
    const yearNum = parseInt(year, 10)
    if (!isNaN(yearNum)) params.push(yearNum)
  }

  const result = await db.query(sql, params)
  const rows = result.rows as Record<string, unknown>[]

  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const data = [headers, ...rows.map((row) => headers.map((h) => row[h]))]

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Export')

  const fileName = `${label.replace(/[^a-z0-9äöüÄÖÜ_\- ]/gi, '_')}`

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } else {
    const bookType = format === 'ods' ? 'ods' : 'xlsx'
    XLSX.writeFile(wb, `${fileName}.${format}`, { bookType })
  }
}

export const ProjectExportsRun = ({ from }: { from: string }) => {
  const { projectId } = useParams({ from })
  const { navData } = useProjectExportsRunNavData({ projectId })
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const [labelFilter, setLabelFilter] = useAtom(projectExportsRunLabelFilterAtom)
  const setFilteredCount = useSetAtom(projectExportsRunFilteredCountAtom)
  const db = usePGlite()

  const currentYear = new Date().getFullYear().toString()
  const [year, setYear] = useState(currentYear)

  // Load both assigned exports and project_exports for this project
  const exportsRes = useLiveQuery(
    `SELECT e.exports_id AS exports_id,
            COALESCE(NULLIF(e.name_${language}, ''), e.name_de) AS label,
            e.sql
     FROM export_assignments ea
     JOIN exports e ON e.exports_id = ea.exports_id
     WHERE ea.project_id = $1
       AND ea.subproject_id IS NULL
       AND e.sql IS NOT NULL
       AND e.sql != ''
     UNION ALL
     SELECT pe.project_exports_id::text AS exports_id,
            COALESCE(NULLIF(pe.name_${language}, ''), pe.name_de) AS label,
            pe.sql
     FROM project_export_assignments pea
     JOIN project_exports pe ON pe.project_exports_id = pea.project_exports_id
     WHERE pea.project_id = $2
       AND pea.subproject_id IS NULL
       AND pe.sql IS NOT NULL
       AND pe.sql != ''
     ORDER BY label`,
    [projectId, projectId],
  )

  const loading = exportsRes === undefined

  const exportRows: ExportRow[] = (exportsRes?.rows ?? []) as ExportRow[]

  const labelFilteredExports = labelFilter.trim()
    ? exportRows.filter((e) =>
        (e.label ?? '').toLowerCase().includes(labelFilter.toLowerCase()),
      )
    : exportRows

  useEffect(() => {
    setFilteredCount(labelFilteredExports.length)
  }, [labelFilteredExports.length, setFilteredCount])

  if (loading) return <Loading />

  const handleDownload = async (e: ExportRow, format: ExportFormat) => {
    if (!e.sql) return
    try {
      await runAndDownload({
        db,
        sql: e.sql,
        year,
        label: e.label ?? e.exports_id,
        format,
      })
    } catch (error) {
      console.error('Error running export:', error)
    }
  }

  return (
    <div className="list-view">
      <div className="list-view-header">
        <h1>{navData.label}</h1>
      </div>

      <div className="list-container">
        <div className={styles.filters}>
          <Field
            label={formatMessage({
              id: 'exportsRun.year',
              defaultMessage: 'Bericht Jahr',
            })}
          >
            <Input
              value={year}
              onChange={(_, data) => setYear(data.value)}
              className={styles.yearInput}
              appearance="underline"
              type="number"
            />
          </Field>
          <Field
            label={formatMessage({
              id: 'exportsRun.filter',
              defaultMessage: 'Nach Label filtern',
            })}
          >
            <Input
              value={labelFilter}
              onChange={(_, data) => setLabelFilter(data.value)}
              placeholder={formatMessage({
                id: 'exportsRun.filterPlaceholder',
                defaultMessage: 'Filter...',
              })}
              appearance="underline"
              contentAfter={
                labelFilter ? (
                  <Dismiss16Regular
                    className={styles.clearFilter}
                    onClick={() => setLabelFilter('')}
                    aria-label={formatMessage({
                      id: 'exportsRun.clearFilter',
                      defaultMessage: 'Filter leeren',
                    })}
                  />
                ) : undefined
              }
            />
          </Field>
        </div>

        <div className={styles.exportList}>
          {labelFilteredExports.length === 0 ? (
            <Text>
              {formatMessage({
                id: 'exportsRun.empty',
                defaultMessage: 'Keine Exporte vorhanden',
              })}
            </Text>
          ) : (
            labelFilteredExports.map((e) => (
              <div key={e.exports_id} className={styles.exportRow}>
                <Text className={styles.exportLabel}>
                  <HighlightedLabel
                    text={e.label ?? e.exports_id}
                    term={labelFilter}
                  />
                </Text>
                <div className={styles.formatButtons}>
                  <Button
                    appearance="subtle"
                    size="small"
                    onClick={() => handleDownload(e, 'csv')}
                  >
                    CSV
                  </Button>
                  <Button
                    appearance="subtle"
                    size="small"
                    onClick={() => handleDownload(e, 'xlsx')}
                  >
                    XLSX
                  </Button>
                  <Button
                    appearance="subtle"
                    size="small"
                    onClick={() => handleDownload(e, 'ods')}
                  >
                    ODS
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
