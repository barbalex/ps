import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Section } from '../../components/shared/Section.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ChartType } from './ChartType.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

// separate from the route because it is also used inside other forms
export const Form = ({ autoFocusRef, from }: Props) => {
  const { chartId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()
  const res = useLiveQuery(`SELECT * FROM charts WHERE chart_id = $1`, [
    chartId,
  ])
  const row = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    await db.query(`UPDATE charts set ${name} = $1 WHERE chart_id = $2`, [
      value,
      chartId,
    ])
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
        }
        break
      }
    }
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Chart"
        id={chartId}
      />
    )
  }

  // console.log('hello ChartForm', { row, chart_id })

  return (
    <div className="form-container">
      <Section title="General settings">
        <ChartType
          onChange={onChange}
          row={row}
          ref={autoFocusRef}
        />
        <TextField
          label="Title"
          name="title"
          value={row.title}
          onChange={onChange}
        />
      </Section>
      <Section title="Data / Subjects presentation">
        <SwitchField
          label="Current"
          name="years_current"
          value={row.years_current ?? false}
          onChange={onChange}
          validationMessage="The chart shows data of the current year"
        />
        <SwitchField
          label="Previous"
          name="years_previous"
          value={row.years_previous ?? false}
          onChange={onChange}
          validationMessage="The chart shows data of the previous year"
        />
        <TextField
          label="Specific"
          name="years_specific"
          value={row.years_specific}
          type="number"
          onChange={onChange}
          validationMessage="The chart shows data of the specific year entered"
        />
        <TextField
          label="Last X"
          name="years_last_x"
          value={row.years_last_x}
          type="number"
          onChange={onChange}
          validationMessage="The chart shows no more than the last x years (x = value entered)"
        />
        <TextField
          label="Since"
          name="years_since"
          value={row.years_since}
          type="number"
          onChange={onChange}
          validationMessage="The chart shows data since the year entered"
        />
        <TextField
          label="Until"
          name="years_until"
          value={row.years_until}
          type="number"
          onChange={onChange}
          validationMessage="The chart shows data until the year entered"
        />
      </Section>
      <Section title="Data / Subjects presentation">
        <SwitchField
          label="Stack subjects?"
          name="subjects_stacked"
          value={row.subjects_stacked}
          onChange={onChange}
          validationMessage="When true, subjects graphs will be stacked. If false, they will be drawn covering each other"
        />
        <SwitchField
          label="Draw subjects in separate charts?"
          name="subjects_single"
          value={row.subjects_single}
          onChange={onChange}
          validationMessage="When false, subjects will be drawn in a single graph"
        />
        <SwitchField
          label="When multiple subjects exist: show their share as percentage?"
          name="percent"
          value={row.percent}
          onChange={onChange}
          validationMessage="You will see the percentage of every subject, totalling 100%. This only works well when subjects have values for every year"
        />
      </Section>
    </div>
  )
}
