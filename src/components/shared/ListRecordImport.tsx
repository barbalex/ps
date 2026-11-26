import { useMemo, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components'
import { useLiveQuery, usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import { useAtomValue, useSetAtom } from 'jotai'
import { FaFileImport } from 'react-icons/fa'

import { useUrlDesigning } from '../../modules/useUrlDesigning.ts'
import { requirePostgrestToken } from '../../modules/fetchPostgrestToken.ts'
import {
  addNotificationAtom,
  postgrestClientAtom,
  userIdAtom,
} from '../../store.ts'
import {
  allowExtra,
  columnKey,
  columnsFor,
  prepareRecords,
  readRecordSheet,
  type Column,
  type RecordTable,
} from '../../modules/listRecordImport.ts'
import { TooltipButton } from './TooltipButton.tsx'

type Props = {
  projectId: string
  subprojectId?: string
  parentId?: string
  plural: string
}

export function ListRecordImport(props: Props) {
  const [designing] = useUrlDesigning(props.projectId)
  return designing ?
      <DesignerImport
        key={[props.projectId, props.subprojectId, props.parentId].join(':')}
        {...props}
      />
    : null
}

function DesignerImport(props: Props) {
  const user = useAtomValue(userIdAtom)
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)
  const allowed = useLiveQuery(
    `SELECT 1 FROM project_roles WHERE project_id=$1 AND role IN ('own','design')
    AND project_user_id IN (SELECT project_user_id FROM user_project_user_ids($2)) LIMIT 1`,
    [props.projectId, user],
  )
  if (!allowed?.rows.length) return null
  return (
    <>
      <TooltipButton
        icon={<FaFileImport />}
        label={formatMessage({
          id: 'recordImport',
          defaultMessage: 'Aus Datei importieren',
        })}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ImportDialog
          {...props}
          close={() => setOpen(false)}
        />
      )}
    </>
  )
}

const examples: Record<string, string> = {
  text: 'ABC',
  integer: '2025',
  boolean: 'true',
  decimal: '1.5',
  date: '2025-01-31',
  'date-time': '2025-01-31T12:00:00Z',
  time: '12:00',
}

function ImportDialog({
  projectId,
  subprojectId,
  parentId,
  plural,
  close,
}: Props & { close: () => void }) {
  const table: RecordTable = subprojectId ? 'places' : 'subprojects'
  const db = usePGlite()
  const { formatMessage } = useIntl()
  const client = useAtomValue(postgrestClientAtom)
  const notify = useSetAtom(addNotificationAtom)
  const parent = useLiveQuery<{ label: string }>(
    parentId ?
      'SELECT coalesce(label,name,place_id::text) AS label FROM places WHERE place_id=$1'
    : subprojectId ? 'SELECT label FROM subprojects WHERE subproject_id=$1'
    : 'SELECT coalesce(label,name,project_id::text) AS label FROM projects WHERE project_id=$1',
    [parentId ?? subprojectId ?? projectId],
  )
  const fields = useLiveQuery<Column>(
    `SELECT f.name, ft.name AS type, CASE WHEN f.list_id IS NOT NULL THEN ARRAY(
    SELECT to_jsonb(lv)->>('value_' || l.value_type) FROM list_values lv JOIN lists l USING(list_id)
    WHERE lv.list_id=f.list_id AND NOT coalesce(lv.obsolete,false) ORDER BY lv.label
  ) END AS choices FROM fields f JOIN field_types ft USING(field_type_id)
    WHERE f.project_id=$1 AND f.table_name=$2 AND ($2 <> 'places' OR f.level=$3)
      AND f.name IS NOT NULL AND NOT coalesce(f.obsolete,false) ORDER BY f.name`,
    [projectId, table, parentId ? 2 : 1],
  )
  const columns = useMemo(
    (): Column[] => [
      ...columnsFor(table),
      ...(fields?.rows ?? []).map((f) => ({ ...f, custom: true })),
    ],
    [table, fields],
  )
  const [sheet, setSheet] = useState<string[][]>([])
  const [mapping, setMapping] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const inFlight = useRef(false)
  const [error, setError] = useState('')
  const preview = useMemo(
    () => prepareRecords(sheet, columns, mapping),
    [sheet, columns, mapping],
  )
  const headers = sheet[0] ?? []
  async function run(action: () => Promise<void>) {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }
  const ready = !!fields && !!parent?.rows.length && !busy
  const submit = () =>
    run(async () => {
      if (!client) throw new Error('PostgREST is unavailable')
      const token = await requirePostgrestToken()
      const { data, error } = await client
        .rpc('import_list_records', {
          p_project_id: projectId,
          p_subproject_id: subprojectId ?? null,
          p_parent_id: parentId ?? null,
          p_rows: preview.rows,
        })
        .setHeader('Authorization', `Bearer ${token}`)
      if (error) throw new Error(error.message)
      // The server has committed. A failure from here on must not offer to
      // submit the file again: that would create a second batch.
      try {
        if (!Array.isArray(data) || data.length !== preview.rows.length)
          throw new Error('Unexpected import response')
        const id = table === 'places' ? 'place_id' : 'subproject_id'
        const columns =
          (table === 'places' ?
            'place_id, subproject_id, parent_id, level, since, until, relevant_for_reports, label'
          : 'subproject_id, project_id, start_year, end_year') +
          ', name, data, created_at, updated_at, updated_by'
        await db.transaction(async (tx) => {
          await tx.exec('SET LOCAL electric.syncing = true')
          await tx.query(
            `INSERT INTO ${table} (${columns})
            SELECT ${columns} FROM jsonb_populate_recordset(NULL::${table}, $1)
            ON CONFLICT (${id}) DO NOTHING`,
            [JSON.stringify(data)],
          )
          // Sync applies suppress live-query notifications. Notify just this
          // table once, at commit, including if Electric beat the response.
          await tx.query(
            `SELECT pg_notify('table_change__' || relnamespace::text || '__' || oid::text, '')
            FROM pg_class WHERE oid = $1::regclass`,
            [table],
          )
        })
      } catch (e) {
        console.error('Could not display the committed import', e)
        notify({
          intent: 'warning',
          body: formatMessage({
            id: 'recordImportReload',
            defaultMessage:
              'Datensätze wurden erstellt. Bitte die App neu laden, nicht erneut importieren.',
          }),
        })
        close()
        return
      }
      notify({
        intent: 'success',
        body: formatMessage(
          { id: 'recordImported', defaultMessage: '{n} Datensätze erstellt.' },
          { n: data.length },
        ),
      })
      close()
    })
  return (
    <Dialog
      open
      onOpenChange={(_, d) => {
        if (!d.open && !busy) close()
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            {formatMessage(
              { id: 'recordImportTitle', defaultMessage: '{list} importieren' },
              { list: plural },
            )}
          </DialogTitle>
          <DialogContent>
            <p>
              {formatMessage(
                {
                  id: 'recordDestination',
                  defaultMessage:
                    'Ziel: {parent}. Jede Zeile erstellt einen neuen Datensatz. Bestehende Datensätze werden nicht aktualisiert.',
                },
                { parent: parent?.rows[0]?.label ?? '…' },
              )}
            </p>
            <p>
              {formatMessage({
                id: 'recordPrepare',
                defaultMessage:
                  'CSV, TSV, XLSX, XLS oder ODS: In der ersten Zeile stehen eindeutige Spaltennamen. Nur das erste Tabellenblatt wird gelesen. Keine IDs angeben. Zahlen ohne Tausendertrennzeichen, Daten als YYYY-MM-DD. Maximal 10 000 Zeilen.',
              })}
            </p>
            <p>
              {formatMessage({
                id: 'recordOnline',
                defaultMessage:
                  'Zum Erstellen ist eine Verbindung nötig. Bei einem Verbindungsabbruch zuerst die Liste prüfen, bevor Sie erneut importieren.',
              })}
            </p>
            <Button
              disabled={!ready}
              onClick={() =>
                void run(async () => {
                  const x = await import('@e965/xlsx')
                  const book = x.utils.book_new()
                  x.utils.book_append_sheet(
                    book,
                    x.utils.aoa_to_sheet([
                      columns.map(columnKey),
                      columns.map((c) =>
                        c.choices ?
                          (c.choices[0] ?? '')
                        : (examples[c.type] ?? ''),
                      ),
                    ]),
                    table,
                  )
                  x.writeFile(book, `${table}.xlsx`)
                })
              }
            >
              {formatMessage({
                id: 'recordTemplate',
                defaultMessage: 'Beispielvorlage herunterladen',
              })}
            </Button>
            <p>
              <input
                type="file"
                aria-label={formatMessage({
                  id: 'recordChoose',
                  defaultMessage: 'Datei wählen',
                })}
                accept=".csv,.tsv,.xlsx,.xls,.ods"
                disabled={!ready}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  e.target.value = ''
                  setSheet([])
                  setMapping([])
                  void run(async () => {
                    const rows = await readRecordSheet(file)
                    setSheet(rows)
                    setMapping(
                      rows[0].map((h) => {
                        const col =
                          columns.find((c) => columnKey(c) === h) ??
                          columns.find((c) => c.name === h)
                        return (
                          col ? columnKey(col)
                          : allowExtra(h) ? ''
                          : 'skip'
                        )
                      }),
                    )
                  })
                }}
              />
            </p>
            {headers.length > 0 && (
              <>
                <p>
                  {formatMessage({
                    id: 'recordMapping',
                    defaultMessage:
                      'Spalten zuordnen. Zusätzliche Werte in data ändern das Formular nicht.',
                  })}
                </p>
                {headers.map((h, i) => (
                  <div key={h}>
                    <label>
                      {h} →{' '}
                      <select
                        disabled={busy}
                        value={mapping[i]}
                        onChange={(e) =>
                          setMapping((prev) =>
                            prev.map((v, j) => (j === i ? e.target.value : v)),
                          )
                        }
                      >
                        <option
                          value=""
                          disabled
                        >
                          {formatMessage({
                            id: 'recordMapChoose',
                            defaultMessage: 'Zuordnung wählen',
                          })}
                        </option>
                        <option value="skip">
                          {formatMessage({
                            id: 'recordSkip',
                            defaultMessage: 'Überspringen',
                          })}
                        </option>
                        {allowExtra(h) &&
                          !columns.some((c) => c.name === h) && (
                            <option value="extra">data.{h} (text)</option>
                          )}
                        {columns.map((c) => (
                          <option
                            key={columnKey(c)}
                            value={columnKey(c)}
                          >
                            {columnKey(c)} ({c.type})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
                {preview.errors.length ?
                  <pre role="alert">
                    {preview.errors.slice(0, 20).join('\n')}
                  </pre>
                : <>
                    <p>
                      {formatMessage(
                        {
                          id: 'recordPreview',
                          defaultMessage:
                            'Vorschau: {n} neue Datensätze (erste fünf angezeigt).',
                        },
                        { n: preview.rows.length },
                      )}
                    </p>
                    <pre>
                      {JSON.stringify(preview.rows.slice(0, 5), null, 2)}
                    </pre>
                  </>
                }
              </>
            )}
            {error && <p role="alert">{error}</p>}
          </DialogContent>
          <DialogActions>
            <Button
              disabled={busy}
              onClick={close}
            >
              {formatMessage({ id: 'ZSShqa', defaultMessage: 'Abbrechen' })}
            </Button>
            <Button
              appearance="primary"
              disabled={
                !ready || !preview.rows.length || !!preview.errors.length
              }
              onClick={() => void submit()}
            >
              {formatMessage({
                id: 'recordCreate',
                defaultMessage: 'Datensätze erstellen',
              })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
