import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { MdCheck } from 'react-icons/md'
import type { Data } from '@puckeditor/core'

import { LazyPuckEditor } from '../lazyPuck.tsx'
import type { FormDesignRow } from './useFormDesignRow.ts'
import { Loading } from '../Loading.tsx'
import { SwitchField } from '../SwitchField.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { normalizePuckDesign } from '../../../modules/normalizePuckDesign.ts'
import {
  addOperationAtom,
  addNotificationAtom,
  languageAtom,
} from '../../../store.ts'
import type { FieldsWithTypes } from '../Jsonb/index.tsx'

import {
  buildFormDesignConfig,
  placedFieldIds,
  type FormDesignLabels,
} from './buildFormDesignConfig.tsx'
import {
  FormDesignRuntimeContext,
  type FormDesignRuntime,
} from './FormDesignRuntimeContext.tsx'
import styles from './FormDesign.module.css'

const { Button } = fluentUiReactComponents

/**
 * The in-place designer for a form target (the plain form of a table or a
 * table view). Renders the Puck editor where the form's fields would be;
 * the widgets in the preview show the current row's values but write
 * nothing (mode 'preview' in the runtime context). Saves are debounced.
 */
export const FormDesignEditor = ({
  designRow,
  fields,
  data,
  table,
  jsonFieldName = 'data',
  idField,
  id,
}: {
  designRow: FormDesignRow
  fields: FieldsWithTypes[]
  data: Record<string, unknown>
  table: string
  jsonFieldName?: string
  idField: string
  id: string
}) => {
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const navigate = useNavigate()
  const currentSearch = useSearch({ strict: false }) as Record<string, unknown>
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  // the live row for operation `prev` snapshots — kept fresh in a ref so
  // the debounced save always reports the last applied state
  const rowRef = useRef(designRow)
  rowRef.current = designRow

  const labels: FormDesignLabels = {
    layout: formatMessage({ id: 'bFgHiA', defaultMessage: 'Layout' }),
    fields: formatMessage({ id: 'bC8AbC', defaultMessage: 'Felder' }),
    grid: formatMessage({ id: 'bFhIjB', defaultMessage: 'Raster' }),
    heading: formatMessage({ id: 'bFiJkC', defaultMessage: 'Titel' }),
    image: formatMessage({ id: 'bFjKlD', defaultMessage: 'Bild' }),
    spacer: formatMessage({ id: 'bFkLmE', defaultMessage: 'Abstand' }),
    pageBreak: formatMessage({
      id: 'bFlMnF',
      defaultMessage: 'Seitenumbruch',
    }),
  }
  const fieldsKey = fields
    .map(
      (f) =>
        `${f.field_id}/${f.field_label ?? ''}/${f.name ?? ''}/${f.widget_type ?? ''}/${f.list_id ?? ''}`,
    )
    .join('|')
  const config = useMemo(() => {
    return buildFormDesignConfig({ fields, labels })
    // labels derive from the language; fieldsKey captures the field
    // definitions — rebuilding on either is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsKey, language])

  // preview shows the current row's values without writing them
  const runtime: FormDesignRuntime = {
    fields: Object.fromEntries(fields.map((f) => [f.field_id as string, f])),
    data,
    mode: 'preview',
    table,
    jsonFieldName,
    idField,
    id,
  }

  // debounced saving: puck fires onChange for every drag and keystroke
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingData = useRef<Data | null>(null)
  const save = async () => {
    const design = pendingData.current
    if (!design) return
    pendingData.current = null
    const row = rowRef.current
    try {
      await db.query(
        `UPDATE form_designs SET design = $1 WHERE form_design_id = $2`,
        [JSON.stringify(design), row.form_design_id],
      )
      addOperation({
        table: 'form_designs',
        rowIdName: 'form_design_id',
        rowId: row.form_design_id,
        operation: 'update',
        draft: { design },
        prev: { ...row },
      })
    } catch (error) {
      // the editor keeps showing the edited design — without a word the
      // user assumes it was saved
      console.error('Error saving form design:', error)
      addNotification({
        intent: 'error',
        duration: 30000,
        title: formatMessage({
          id: 'bFmNoG',
          defaultMessage: 'Design nicht gespeichert',
        }),
        body: formatMessage(
          {
            id: 'bFnOpH',
            defaultMessage:
              'Das Formular-Design konnte nicht gespeichert werden ({error}). Der Editor zeigt weiter Ihre ungespeicherten Änderungen.',
          },
          { error: error instanceof Error ? error.message : 'unknown' },
        ),
      })
    }
  }
  const onPuckChange = (changed: Data) => {
    pendingData.current = changed
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(save, 500)
  }
  // flush pending changes when leaving the editor; save only touches refs,
  // so the first render's closure stays correct
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      void save()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onActiveChange = async (
    e: React.ChangeEvent<HTMLElement>,
    changed?: unknown,
  ) => {
    const { value } = getValueFromChange(
      e as Parameters<typeof getValueFromChange>[0],
      changed as Parameters<typeof getValueFromChange>[1],
    )
    const row = rowRef.current
    if (row.active === value) return
    try {
      await db.query(
        `UPDATE form_designs SET active = $1 WHERE form_design_id = $2`,
        [value, row.form_design_id],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        active: {
          state: 'error',
          message: error instanceof Error ? error.message : String(error),
        },
      }))
      return
    }
    setValidations((prev) => {
      const { active: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'form_designs',
      rowIdName: 'form_design_id',
      rowId: row.form_design_id,
      operation: 'update',
      draft: { active: value },
      prev: { ...row },
    })
  }

  const closeEditor = () => {
    const { formDesign: _, ...rest } = currentSearch
    navigate({ search: rest as never })
  }

  const unplacedFields = fields.filter(
    (field) => !placedFieldIds(designRow.design).has(field.field_id ?? ''),
  )
  const hasContent = !!designRow.design?.content?.length

  return (
    <div className={styles.editor}>
      <div className={`${styles.toolbar} print-hide`}>
        <SwitchField
          label={formatMessage({
            id: 'bFoPqI',
            defaultMessage: 'Eigenes Formular verwenden',
          })}
          name="active"
          value={designRow.active}
          onChange={onActiveChange}
          validationState={validations?.active?.state}
          validationMessage={validations?.active?.message}
        />
        <Button
          size="medium"
          icon={<MdCheck />}
          onClick={closeEditor}
        >
          {formatMessage({ id: 'bFpQrJ', defaultMessage: 'Fertig' })}
        </Button>
      </div>
      {/* the flex chain gives Puck's height:100% layout a definite height —
          auto-height wrappers in between would collapse its panes */}
      <div className={styles.editorBody}>
        <FormDesignRuntimeContext.Provider value={runtime}>
          <Suspense fallback={<Loading />}>
            <LazyPuckEditor
            key={language}
            config={config}
            data={
              normalizePuckDesign(
                designRow.design ?? {
                  content: [],
                },
              ) as Parameters<typeof LazyPuckEditor>[0]['data']
            }
            onChange={onPuckChange}
            sidebarExtra={
              <>
                {fields.length === 0 && (
                  <div className={styles.warning}>
                    {formatMessage({
                      id: 'bC4wXy',
                      defaultMessage:
                        'Noch keine Felder — zuerst Felder zu diesem Projekt hinzufügen.',
                    })}
                  </div>
                )}
                {hasContent && unplacedFields.length > 0 && (
                  <div className={styles.warning}>
                    {formatMessage(
                      {
                        id: 'bFqRsK',
                        defaultMessage:
                          'Nicht im Formular platziert (für Benutzer unsichtbar): {names}',
                      },
                      {
                        names: unplacedFields
                          .map((f) => f.field_label || f.name)
                          .join(', '),
                      },
                    )}
                  </div>
                )}
              </>
            }
            previewExtra={
              !hasContent && (
                <div className={styles.emptyPreview}>
                  {formatMessage({
                    id: 'bFrStL',
                    defaultMessage:
                      'Felder und Layout-Bausteine in das Formular ziehen',
                  })}
                </div>
              )
            }
          />
          </Suspense>
        </FormDesignRuntimeContext.Provider>
      </div>
    </div>
  )
}
