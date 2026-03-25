import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { Loading } from '../components/shared/Loading.tsx'
import {
  languageAtom,
  qcsRunOnlyWithResultsAtom,
  qcsRunLabelFilterAtom,
  qcsRunFilteredCountAtom,
} from '../store.ts'
import { Dismiss16Regular } from '@fluentui/react-icons'
import { QcsResultDialog } from '../components/QcsResultDialog/index.tsx'

import '../form.css'

const { Button, Input, Field, Card, CardHeader, Spinner, Text, Switch } =
  fluentUiReactComponents

type QcRow = {
  qcs_id: string
  label: string | null
  sql: string | null
  filter_by_year: boolean | null
}

type ResultRow = {
  label?: string | null
  url?: string | null
  [key: string]: unknown
}

type QcResult = {
  qc: QcRow
  rows: ResultRow[]
  error?: string
}

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
          <mark
            key={i}
            style={{
              background: 'var(--colorBrandBackground2)',
              color: 'inherit',
              padding: '0 1px',
              borderRadius: 2,
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}

export const SubprojectQcsRun = ({ from }: { from: string }) => {
  const { subprojectId } = useParams({ from })
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const [onlyWithResults, setOnlyWithResults] = useAtom(qcsRunOnlyWithResultsAtom)
  const [labelFilter, setLabelFilter] = useAtom(qcsRunLabelFilterAtom)
  const setFilteredCount = useSetAtom(qcsRunFilteredCountAtom)
  const db = usePGlite()
  const navigate = useNavigate()

  const currentYear = new Date().getFullYear().toString()
  const [year, setYear] = useState(currentYear)
  const [results, setResults] = useState<QcResult[] | null>(null)
  const [running, setRunning] = useState(false)
  const [dialogUrl, setDialogUrl] = useState<string | null>(null)
  const [dialogLabel, setDialogLabel] = useState<string | null>(null)

  // Load chosen QCs for this subproject, joined with qcs data
  const qcsRes = useLiveQuery(
    `SELECT q.qcs_id,
            COALESCE(NULLIF(q.label_${language}, ''), q.label_de) AS label,
            q.sql,
            q.filter_by_year
     FROM qcs_assignment qa
     JOIN qcs q ON q.qcs_id = qa.qc_id
     WHERE qa.subproject_id = $1
       AND q.sql IS NOT NULL
       AND q.sql != ''
     ORDER BY label`,
    [subprojectId],
  )

  const loading = qcsRes === undefined

  // Run all QC queries whenever runKey changes (and QCs are loaded)
  const runAllQcs = useCallback(
    async (qcs: QcRow[], yearValue: string) => {
      setRunning(true)
      const out: QcResult[] = []
      for (const qc of qcs) {
        if (!qc.sql) continue
        try {
          const params: (string | number)[] = []
          if (qc.sql.includes('$1')) params.push(subprojectId)
          if (qc.filter_by_year && qc.sql.includes('$2')) {
            const yearNum = parseInt(yearValue, 10)
            if (!isNaN(yearNum)) params.push(yearNum)
          }
          const res = await db.query<ResultRow>(qc.sql, params)
          out.push({ qc, rows: res.rows })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          out.push({ qc, rows: [], error: msg })
        }
      }
      setResults(out)
      setRunning(false)
    },
    [db, subprojectId],
  )

  // Run automatically on first load
  useEffect(() => {
    if (loading) return
    const qcs = (qcsRes?.rows ?? []) as QcRow[]
    runAllQcs(qcs, year)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const handleReanalyse = () => {
    const qcs = (qcsRes?.rows ?? []) as QcRow[]
    runAllQcs(qcs, year)
  }

  const title = formatMessage({
    id: 'subprojectQcsRun.title',
    defaultMessage: 'Qualitätskontrollen: ausführen',
  })

  // Filter results by label
  const filteredResults = (results ?? []).filter((r) => {
    if (onlyWithResults && r.rows.length === 0 && !r.error) return false
    if (!labelFilter.trim()) return true
    return (r.qc.label ?? '').toLowerCase().includes(labelFilter.toLowerCase())
  })

  // Keep nav hook in sync with current filtered count
  useEffect(() => {
    if (results === null) return
    setFilteredCount(filteredResults.length)
  }, [filteredResults.length, results, setFilteredCount])

  if (loading) return <Loading />

  return (
    <div className="list-view">
      <div className="list-view-header">
        <h1>{title}</h1>
      </div>

      <div className="list-container">
        {/* Controls */}
        <div
          style={{
            padding: '8px 10px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <Field
            label={formatMessage({
              id: 'subprojectQcsRun.year',
              defaultMessage: 'Bericht Jahr',
            })}
          >
            <Input
              value={year}
              onChange={(_, data) => setYear(data.value)}
              style={{ width: 90 }}
              appearance="underline"
              type="number"
            />
          </Field>
          <Field
            label={formatMessage({
              id: 'subprojectQcsRun.filter',
              defaultMessage: 'Nach Label filtern',
            })}
          >
            <Input
              value={labelFilter}
              onChange={(_, data) => setLabelFilter(data.value)}
              placeholder={formatMessage({
                id: 'subprojectQcsRun.filterPlaceholder',
                defaultMessage: 'Filter...',
              })}
              appearance="underline"
              contentAfter={
                labelFilter ? (
                  <Dismiss16Regular
                    style={{ cursor: 'pointer' }}
                    onClick={() => setLabelFilter('')}
                    aria-label={formatMessage({
                      id: 'subprojectQcsRun.clearFilter',
                      defaultMessage: 'Filter leeren',
                    })}
                  />
                ) : undefined
              }
            />
          </Field>
          <Switch
            checked={onlyWithResults}
            onChange={(_, data) => setOnlyWithResults(data.checked)}
            label={formatMessage({
              id: 'subprojectQcsRun.onlyWithResults',
              defaultMessage: 'Nur mit Befunden',
            })}
          />
          <Button
            appearance="primary"
            onClick={handleReanalyse}
            disabled={running}
            icon={running ? <Spinner size="tiny" /> : undefined}
          >
            {formatMessage({
              id: 'subprojectQcsRun.reanalyse',
              defaultMessage: 'Neu analysieren',
            })}
          </Button>
        </div>

        {/* Results area */}
        <div
          style={{
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {running && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spinner size="small" />
              <Text>
                {formatMessage({
                  id: 'subprojectQcsRun.running',
                  defaultMessage: 'Analysiere...',
                })}
              </Text>
            </div>
          )}

          {!running &&
            filteredResults.map(({ qc, rows, error }) => (
              <Card key={qc.qcs_id} style={{ maxWidth: 800 }}>
                <CardHeader
                  header={
                    <Text weight="semibold">
                      <HighlightedLabel
                        text={qc.label ?? qc.qcs_id}
                        term={labelFilter}
                      />
                    </Text>
                  }
                />
                <div style={{ padding: '0 12px 12px' }}>
                  {error ? (
                    <Text
                      style={{
                        color: 'var(--colorPaletteRedForeground1)',
                        fontFamily: 'monospace',
                        fontSize: '0.85em',
                      }}
                    >
                      {error}
                    </Text>
                  ) : rows.length === 0 ? (
                    <Text
                      style={{ color: 'var(--colorNeutralForeground3)' }}
                    >
                      {formatMessage({
                        id: 'subprojectQcsRun.allOk',
                        defaultMessage: 'Alles i.O.',
                      })}
                    </Text>
                  ) : (
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      {rows.map((row, i) => {
                        const label =
                          row.label ?? String(Object.values(row)[0] ?? '')
                        const url = row.url as string | undefined
                        return (
                          <li
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            {url ? (
                              <Text
                                style={{ cursor: 'pointer', color: 'var(--colorBrandForeground1)', textDecoration: 'underline' }}
                                onClick={() => {
                                  setDialogUrl(url)
                                  setDialogLabel(label)
                                }}
                              >
                                {label}
                              </Text>
                            ) : (
                              <Text>{label}</Text>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </Card>
            ))}
        </div>
      </div>
      <QcsResultDialog
        url={dialogUrl}
        label={dialogLabel}
        onClose={() => {
          setDialogUrl(null)
          setDialogLabel(null)
        }}
        onNavigate={(url) => {
          setDialogUrl(null)
          setDialogLabel(null)
          navigate({ to: url })
        }}
      />
    </div>
  )
}
