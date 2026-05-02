import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { useProjectQcsRunNavData } from '../modules/useProjectQcsRunNavData.ts'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { Loading } from '../components/shared/Loading.tsx'
import {
  languageAtom,
  projectQcsRunOnlyWithResultsAtom,
  projectQcsRunLabelFilterAtom,
  projectQcsRunFilteredCountAtom,
} from '../store.ts'
import { Dismiss16Regular, WindowEdit16Regular } from '@fluentui/react-icons'
import { QcsResultDialog } from '../components/QcsResultDialog/index.tsx'
import styles from './projectQcsRun.module.css'

import '../form.css'

const { Button, Input, Field, Card, CardHeader, Text, Switch, Tooltip } =
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

type QcCardProps = {
  qc: QcRow
  projectId: string
  year: string
  labelFilter: string
  onlyWithResults: boolean
  onOpenDialog: (url: string, label: string) => void
}

function QcCard({
  qc,
  projectId,
  year,
  labelFilter,
  onlyWithResults,
  onOpenDialog,
}: QcCardProps) {
  const { formatMessage } = useIntl()

  // Project QCS: $1 = projectId, $2 = year (if filter_by_year)
  const params: (string | number)[] = []
  if (qc.sql!.includes('$1')) params.push(projectId)
  if (qc.filter_by_year && qc.sql!.includes('$2')) {
    const yearNum = parseInt(year, 10)
    if (!isNaN(yearNum)) params.push(yearNum)
  }

  const result = useLiveQuery<ResultRow>(qc.sql!, params)

  if (result === undefined) return null
  const rows = result.rows

  if (onlyWithResults && rows.length === 0) return null

  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <Text weight="semibold">
            <HighlightedLabel text={qc.label ?? qc.qcs_id} term={labelFilter} />
          </Text>
        }
      />
      <div className={styles.cardBody}>
        {rows.length === 0 ? (
          <Text className={styles.emptyText}>
            {formatMessage({
              id: 'projectQcsRun.allOk',
              defaultMessage: 'Alles i.O.',
            })}
          </Text>
        ) : (
          <ul className={styles.resultList}>
            {rows.map((row, i) => {
              const label = row.label ?? String(Object.values(row)[0] ?? '')
              const url = row.url as string | undefined
              return (
                <li key={i} className={styles.resultItem}>
                  {url ? (
                    <>
                      <Link to={url} className={styles.resultLink}>
                        {label}
                      </Link>
                      <Tooltip
                        content={formatMessage({
                          id: 'subprojectQcsRun.openInDialog',
                          defaultMessage: 'Im Dialog öffnen',
                        })}
                        relationship="label"
                      >
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<WindowEdit16Regular />}
                          onClick={() =>
                            onOpenDialog(
                              url,
                              `${qc.label ?? qc.qcs_id}: ${label}`,
                            )
                          }
                        />
                      </Tooltip>
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
  )
}

export const ProjectQcsRun = ({ from }: { from: string }) => {
  const { projectId } = useParams({ from })
  const { navData } = useProjectQcsRunNavData({ projectId })
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const [onlyWithResults, setOnlyWithResults] = useAtom(
    projectQcsRunOnlyWithResultsAtom,
  )
  const [labelFilter, setLabelFilter] = useAtom(projectQcsRunLabelFilterAtom)
  const setFilteredCount = useSetAtom(projectQcsRunFilteredCountAtom)
  const navigate = useNavigate()

  const currentYear = new Date().getFullYear().toString()
  const [year, setYear] = useState(currentYear)
  const [dialogUrl, setDialogUrl] = useState<string | null>(null)
  const [dialogLabel, setDialogLabel] = useState<string | null>(null)

  // Load chosen QCs for this project
  const qcsRes = useLiveQuery(
    `SELECT q.qcs_id,
            COALESCE(NULLIF(q.name_${language}, ''), q.name_de) AS label,
            q.sql,
            q.filter_by_year
     FROM qcs_assignment qa
     JOIN qcs q ON q.qcs_id = qa.qc_id
     WHERE qa.project_id = $1
       AND qa.subproject_id IS NULL
       AND q.sql IS NOT NULL
       AND q.sql != ''
     ORDER BY label`,
    [projectId],
  )

  const loading = qcsRes === undefined

  const qcRows: QcRow[] = (qcsRes?.rows ?? []) as QcRow[]

  const labelFilteredQcs = labelFilter.trim()
    ? qcRows.filter((qc) =>
        (qc.label ?? '').toLowerCase().includes(labelFilter.toLowerCase()),
      )
    : qcRows

  useEffect(() => {
    setFilteredCount(labelFilteredQcs.length)
  }, [labelFilteredQcs.length, setFilteredCount])

  if (loading) return <Loading />

  return (
    <div className="list-view">
      <div className="list-view-header">
        <h1>{navData.label}</h1>
      </div>

      <div className="list-container">
        <div className={styles.filters}>
          <Field
            label={formatMessage({
              id: 'subprojectQcsRun.year',
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
                    className={styles.clearFilter}
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
        </div>

        <div className={styles.cards}>
          {labelFilteredQcs.map((qc) => (
            <QcCard
              key={qc.qcs_id}
              qc={qc}
              projectId={projectId}
              year={year}
              labelFilter={labelFilter}
              onlyWithResults={onlyWithResults}
              onOpenDialog={(url, label) => {
                setDialogUrl(url)
                setDialogLabel(label)
              }}
            />
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
