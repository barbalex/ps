import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { Loading } from '../components/shared/Loading.tsx'
import { languageAtom } from '../store.ts'

import '../form.css'

const { Button, Input, Field, Card, CardHeader, Link, Spinner, Text } =
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
          <mark key={i} style={{ background: 'var(--colorBrandBackground2)', color: 'inherit', padding: '0 1px', borderRadius: 2 }}>
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
  const db = usePGlite()

  const currentYear = new Date().getFullYear().toString()
  const [year, setYear] = useState(currentYear)
  const [labelFilter, setLabelFilter] = useState('')
  const [results, setResults] = useState<QcResult[] | null>(null)
  const [running, setRunning] = useState(false)
  // track run counter so we can trigger re-run
  const [runKey, setRunKey] = useState(0)

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
          if (res.rows.length > 0) {
            out.push({ qc, rows: res.rows })
          }
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

  // Run automatically on first load and when runKey changes
  const hasRunRef = useRef(false)
  useEffect(() => {
    if (loading) return
    const qcs = (qcsRes?.rows ?? []) as QcRow[]
    if (!hasRunRef.current || runKey > 0) {
      hasRunRef.current = true
      runAllQcs(qcs, year)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, runKey])

  const handleReanalyse = () => {
    setRunKey((k) => k + 1)
  }

  const title = formatMessage({
    id: 'subprojectQcsRun.title',
    defaultMessage: 'Qualitätskontrollen ausführen',
  })

  if (loading) return <Loading />

  // Filter results by label
  const filteredResults = (results ?? []).filter((r) => {
    if (!labelFilter.trim()) return true
    return (r.qc.label ?? '').toLowerCase().includes(labelFilter.toLowerCase())
  })

  // Shown cards = those with rows (or with errors)
  const visibleCards = filteredResults.filter(
    (r) => r.rows.length > 0 || r.error,
  )
  const allClean =
    results !== null && !running && visibleCards.length === 0

  return (
    <div className="list-view">
      <div className="list-view-header">
        <h1>{title}</h1>
      </div>

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
            defaultMessage: 'QK-Label filtern',
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
          />
        </Field>
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
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 12 }}>
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

        {allClean && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              fontSize: '1.4em',
              animation: 'celebrate 0.6s ease-out',
            }}
          >
            <style>{`
              @keyframes celebrate {
                0%   { transform: scale(0.7); opacity: 0; }
                60%  { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1);   opacity: 1; }
              }
            `}</style>
            <div style={{ fontSize: '3em', marginBottom: 8 }}>🎉</div>
            <div style={{ fontWeight: 600 }}>
              {formatMessage({
                id: 'subprojectQcsRun.allClean',
                defaultMessage: 'Juhui, nichts zu meckern',
              })}
            </div>
          </div>
        )}

        {!running &&
          visibleCards.map(({ qc, rows, error }) => (
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
                    style={{ color: 'var(--colorPaletteRedForeground1)', fontFamily: 'monospace', fontSize: '0.85em' }}
                  >
                    {error}
                  </Text>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {rows.map((row, i) => {
                      const label = row.label ?? String(Object.values(row)[0] ?? '')
                      const url = row.url as string | undefined
                      return (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {url ? (
                            <>
                              <Link href={url} target="_self">
                                {label}
                              </Link>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={formatMessage({
                                  id: 'subprojectQcsRun.openNewTab',
                                  defaultMessage: 'In neuem Tab öffnen',
                                })}
                                style={{ color: 'var(--colorNeutralForeground3)', lineHeight: 1, display: 'flex', alignItems: 'center' }}
                              >
                                {/* External link icon (inline SVG) */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                              </a>
                            </>
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
  )
}
