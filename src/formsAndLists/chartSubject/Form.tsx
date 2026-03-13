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
import { Table } from './Table.tsx'
import { ValueSource } from './ValueSource.tsx'
import { Field } from './Field.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type ChartSubjects from '../../models/public/ChartSubjects.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/$chartSubjectId/'

// separate from the route because it is also used inside other forms
export const ChartSubjectForm = ({ autoFocusRef }: Props) => {
  const { chartSubjectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const { formatMessage } = useIntl()

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM chart_subjects WHERE chart_subject_id = $1`,
    [chartSubjectId],
  )
  const row: ChartSubjects | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE chart_subjects SET ${name} = $1 WHERE chart_subject_id = $2`,
        [value, chartSubjectId],
      )
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
    addOperation({
      table: 'chart_subjects',
      rowIdName: 'chart_subject_id',
      rowId: chartSubjectId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Chart Subject" id={chartSubjectId} />
  }

  return (
    <div className="form-container">
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row.name}
        onChange={onChange}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <Section title={formatMessage({ id: 'bDbEhF', defaultMessage: 'Daten' })}>
        <Table
          onChange={onChange}
          row={row}
          ref={autoFocusRef}
          validations={validations}
        />
        <TextField
          label={formatMessage({ id: 'bDvYbZ', defaultMessage: 'Filter' })}
          name="table_filter"
          value={row.table_filter}
          onChange={onChange}
          validationState={validations?.table_filter?.state}
          validationMessage={
            validations?.table_filter?.message ??
            formatMessage({
              id: 'bDwZcA',
              defaultMessage:
                'TODO: Ein Filter, der auf die Tabelle angewendet wird',
            })
          }
        />
        <ValueSource onChange={onChange} row={row} validations={validations} />
        {row.calc_method && row.calc_method !== 'count_rows' && (
          <>
            <Field onChange={onChange} row={row} validations={validations} />
            <TextField
              label={formatMessage({ id: 'bDkNqO', defaultMessage: 'Einheit' })}
              name="value_unit"
              value={row.value_unit}
              type="number"
              onChange={onChange}
              validationState={validations?.value_unit?.state}
              validationMessage={validations?.value_unit?.message}
            />
          </>
        )}
      </Section>
      <Section
        title={formatMessage({ id: 'bDlOrP', defaultMessage: 'Darstellung' })}
      >
        <TextField
          label={formatMessage({ id: 'bDmPsQ', defaultMessage: 'Sortierung' })}
          name="sort"
          value={row.sort}
          type="number"
          onChange={onChange}
          validationState={validations?.sort?.state}
          validationMessage={
            validations.sort?.message ??
            formatMessage({
              id: 'bDnQtR',
              defaultMessage:
                'Themen werden nach diesem Wert sortiert, sofern gesetzt. Sonst nach Name',
            })
          }
        />
        <SwitchField
          label={formatMessage({
            id: 'bDoRuS',
            defaultMessage: 'Fehlende Daten verbinden',
          })}
          name="connect_nulls"
          value={row.connect_nulls}
          onChange={onChange}
          validationState={validations?.connect_nulls?.state}
          validationMessage={
            validations.connect_nulls?.message ??
            formatMessage({
              id: 'bDpSvT',
              defaultMessage:
                'Wenn aktiviert, wird auch bei fehlenden Datenpunkten eine Linie gezeichnet',
            })
          }
        />
      </Section>
      <Section
        title={formatMessage({ id: 'bDqTwU', defaultMessage: 'Styling' })}
      >
        <TextField
          label={formatMessage({ id: 'bDrUxV', defaultMessage: 'Linienfarbe' })}
          name="stroke"
          value={row.stroke}
          type="color"
          onChange={onChange}
          validationState={validations?.stroke?.state}
          validationMessage={validations?.stroke?.message}
        />
        <TextField
          label={formatMessage({
            id: 'bDsVyW',
            defaultMessage: 'F\u00fcllfarbe',
          })}
          name="fill"
          value={row.fill}
          type="color"
          onChange={onChange}
          validationState={validations?.fill?.state}
          validationMessage={validations?.fill?.message}
        />
        <SwitchField
          label={formatMessage({
            id: 'bDtWzX',
            defaultMessage: 'F\u00fcllung mit Verlauf',
          })}
          name="fill_graded"
          value={row.fill_graded}
          onChange={onChange}
          validationState={validations?.fill_graded?.state}
          validationMessage={
            validations.fill_graded?.message ??
            formatMessage({
              id: 'bDuXaY',
              defaultMessage:
                'Wenn aktiviert, wird die Fl\u00e4che mit einem Verlauf gef\u00fcllt. Hilfreich wenn mehrere Themen sich \u00fcberlagern',
            })
          }
        />
      </Section>
    </div>
  )
}
