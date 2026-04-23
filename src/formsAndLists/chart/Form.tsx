import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Section } from '../../components/shared/Section.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ChartType } from './ChartType.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Charts from '../../models/public/Charts.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
  from: string
}

// separate from the route because it is also used inside other forms
export const Form = ({ autoFocusRef, from }: Props) => {
  const { chartId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const { formatMessage } = useIntl()

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM charts WHERE chart_id = $1`, [
    chartId,
  ])
  const row: Charts | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(`UPDATE charts set ${name} = $1 WHERE chart_id = $2`, [
        value,
        chartId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    const draft = { [name]: value }
    addOperation({
      table: 'charts',
      rowIdName: 'chart_id',
      rowId: chartId,
      operation: 'update',
      draft,
      prev: { ...row },
    })
    // if one of the years settings is changed, prevent conflicts
    switch (name) {
      case 'years_current': {
        if (value) {
          await db.query(
            `
                UPDATE charts set 
                  years_previous = $1, 
                  years_specific = $2, 
                  years_last_x = $3, 
                  years_since = $4, 
                  years_until = $5 
                WHERE 
                  chart_id = $6
              `,
            [false, null, null, null, null, chartId],
          )
          addOperation({
            table: 'charts',
            rowIdName: 'chart_id',
            rowId: chartId,
            operation: 'update',
            draft: {
              years_previous: false,
              years_specific: null,
              years_last_x: null,
              years_since: null,
              years_until: null,
            },
            prev: { ...row, ...draft },
          })
        }
        break
      }
      case 'years_previous': {
        if (value) {
          await db.query(
            `
                UPDATE charts set 
                  years_current = $1, 
                  years_specific = $2, 
                  years_last_x = $3, 
                  years_since = $4, 
                  years_until = $5 
                WHERE 
                  chart_id = $6
              `,
            [false, null, null, null, null, chartId],
          )
          addOperation({
            table: 'charts',
            rowIdName: 'chart_id',
            rowId: chartId,
            operation: 'update',
            draft: {
              years_current: false,
              years_specific: null,
              years_last_x: null,
              years_since: null,
              years_until: null,
            },
            prev: { ...row, ...draft },
          })
        }
        break
      }
      case 'years_specific': {
        if (value) {
          await db.query(
            `
                UPDATE charts set 
                  years_current = $1, 
                  years_previous = $2, 
                  years_last_x = $3, 
                  years_since = $4, 
                  years_until = $5 
                WHERE 
                  chart_id = $6
              `,
            [false, false, null, null, null, chartId],
          )
          addOperation({
            table: 'charts',
            rowIdName: 'chart_id',
            rowId: chartId,
            operation: 'update',
            draft: {
              years_current: false,
              years_previous: false,
              years_last_x: null,
              years_since: null,
              years_until: null,
            },
            prev: { ...row, ...draft },
          })
        }
        break
      }
      case 'years_last_x': {
        if (value) {
          await db.query(
            `
                UPDATE charts set 
                  years_current = $1, 
                  years_previous = $2, 
                  years_specific = $3, 
                  years_since = $4, 
                  years_until = $5 
                WHERE 
                  chart_id = $6
              `,
            [false, false, null, null, null, chartId],
          )
          addOperation({
            table: 'charts',
            rowIdName: 'chart_id',
            rowId: chartId,
            operation: 'update',
            draft: {
              years_current: false,
              years_previous: false,
              years_specific: null,
              years_since: null,
              years_until: null,
            },
            prev: { ...row, ...draft },
          })
        }
        break
      }
      case 'years_since': {
        if (value) {
          await db.query(
            `
                UPDATE charts set 
                  years_current = $1, 
                  years_previous = $2, 
                  years_specific = $3, 
                  years_last_x = $4, 
                  years_until = $5 
                WHERE 
                  chart_id = $6
              `,
            [false, false, null, null, null, chartId],
          )
          addOperation({
            table: 'charts',
            rowIdName: 'chart_id',
            rowId: chartId,
            operation: 'update',
            draft: {
              years_current: false,
              years_previous: false,
              years_specific: null,
              years_last_x: null,
              years_until: null,
            },
            prev: { ...row, ...draft },
          })
        }
        break
      }
      case 'years_until': {
        if (value) {
          await db.query(
            `
                UPDATE charts set 
                  years_current = $1, 
                  years_previous = $2, 
                  years_specific = $3, 
                  years_last_x = $4, 
                  years_since = $5 
                WHERE 
                  chart_id = $6
              `,
            [false, false, null, null, null, chartId],
          )
          addOperation({
            table: 'charts',
            rowIdName: 'chart_id',
            rowId: chartId,
            operation: 'update',
            draft: {
              years_current: false,
              years_previous: false,
              years_specific: null,
              years_last_x: null,
              years_since: null,
            },
            prev: { ...row, ...draft },
          })
        }
        break
      }
    }
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Chart" id={chartId} />
  }

  // console.log('hello ChartForm', { row, chart_id })
  const dataSubjectSectionTitle = formatMessage({
    id: 'bCGjKl',
    defaultMessage: 'Daten / Subjekt-Darstellung',
  })

  return (
    <div className="form-container">
      <Section
        title={formatMessage({
          id: 'bCFiJk',
          defaultMessage: 'Allgemeine Einstellungen',
        })}
      >
        <ChartType
          onChange={onChange}
          row={row}
          ref={autoFocusRef}
          validations={validations}
        />
        <TextField
          label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
          name="name"
          value={row.name}
          onChange={onChange}
          validationState={validations?.name?.state}
          validationMessage={validations?.name?.message}
        />
      </Section>
      <Section title={dataSubjectSectionTitle}>
        <SwitchField
          label={formatMessage({
            id: 'bCJmNo',
            defaultMessage: 'Aktuelles Jahr',
          })}
          name="years_current"
          value={row.years_current ?? false}
          onChange={onChange}
          validationState={validations?.years_current?.state}
          validationMessage={
            validations.years_current?.message ??
            formatMessage({
              id: 'bCKnOp',
              defaultMessage: 'Das Diagramm zeigt Daten des aktuellen Jahres',
            })
          }
        />
        <SwitchField
          label={formatMessage({
            id: 'bCLoQr',
            defaultMessage: 'Vorheriges Jahr',
          })}
          name="years_previous"
          value={row.years_previous ?? false}
          onChange={onChange}
          validationState={validations?.years_previous?.state}
          validationMessage={
            validations.years_previous?.message ??
            formatMessage({
              id: 'bCMpRs',
              defaultMessage: 'Das Diagramm zeigt Daten des vorherigen Jahres',
            })
          }
        />
        <TextField
          label={formatMessage({
            id: 'bCNqSt',
            defaultMessage: 'Bestimmtes Jahr',
          })}
          name="years_specific"
          value={row.years_specific}
          type="number"
          onChange={onChange}
          validationState={validations?.years_specific?.state}
          validationMessage={
            validations.years_specific?.message ??
            formatMessage({
              id: 'bCOrTu',
              defaultMessage:
                'Das Diagramm zeigt Daten des eingegebenen Jahres',
            })
          }
        />
        <TextField
          label={formatMessage({
            id: 'bCPsUv',
            defaultMessage: 'Letzte X Jahre',
          })}
          name="years_last_x"
          value={row.years_last_x}
          type="number"
          onChange={onChange}
          validationState={validations?.years_last_x?.state}
          validationMessage={
            validations.years_last_x?.message ??
            formatMessage({
              id: 'bCQtVw',
              defaultMessage:
                'Das Diagramm zeigt höchstens die letzten x Jahre (x = eingegebener Wert)',
            })
          }
        />
        <TextField
          label={formatMessage({ id: 'bCRuWx', defaultMessage: 'Seit' })}
          name="years_since"
          value={row.years_since}
          type="number"
          onChange={onChange}
          validationState={validations?.years_since?.state}
          validationMessage={
            validations.years_since?.message ??
            formatMessage({
              id: 'bCSvXy',
              defaultMessage:
                'Das Diagramm zeigt Daten seit dem eingegebenen Jahr',
            })
          }
        />
        <TextField
          label={formatMessage({ id: 'bCTwYz', defaultMessage: 'Bis' })}
          name="years_until"
          value={row.years_until}
          type="number"
          onChange={onChange}
          validationState={validations?.years_until?.state}
          validationMessage={
            validations.years_until?.message ??
            formatMessage({
              id: 'bCUxZa',
              defaultMessage:
                'Das Diagramm zeigt Daten bis zum eingegebenen Jahr',
            })
          }
        />
      </Section>
      <Section title={dataSubjectSectionTitle}>
        <SwitchField
          label={formatMessage({
            id: 'bCVyAb',
            defaultMessage: 'Subjekte stapeln?',
          })}
          name="subjects_stacked"
          value={row.subjects_stacked}
          onChange={onChange}
          validationState={validations?.subjects_stacked?.state}
          validationMessage={
            validations.subjects_stacked?.message ??
            formatMessage({
              id: 'bCWzBc',
              defaultMessage:
                'Wenn aktiviert, werden Subjekt-Graphen gestapelt. Wenn nicht, überlagern sie sich',
            })
          }
        />
        <SwitchField
          label={formatMessage({
            id: 'bCXaBd',
            defaultMessage: 'Subjekte in separaten Diagrammen darstellen?',
          })}
          name="subjects_single"
          value={row.subjects_single}
          onChange={onChange}
          validationState={validations?.subjects_single?.state}
          validationMessage={
            validations.subjects_single?.message ??
            formatMessage({
              id: 'bCYbCe',
              defaultMessage:
                'Wenn deaktiviert, werden Subjekte in einem einzigen Diagramm dargestellt',
            })
          }
        />
        <SwitchField
          label={formatMessage({
            id: 'bCZcDf',
            defaultMessage:
              'Bei mehreren Subjekten: Anteil als Prozent anzeigen?',
          })}
          name="percent"
          value={row.percent}
          onChange={onChange}
          validationState={validations?.percent?.state}
          validationMessage={
            validations.percent?.message ??
            formatMessage({
              id: 'bDaDgE',
              defaultMessage:
                'Du siehst den prozentualen Anteil jedes Subjekts, zusammen 100%. Funktioniert am besten, wenn Subjekte für jedes Jahr Werte haben',
            })
          }
        />
      </Section>
    </div>
  )
}
