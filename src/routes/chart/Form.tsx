import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import type { InputProps } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions'
import { SwitchField } from '../../components/shared/SwitchField'
import { getValueFromChange } from '../../modules/getValueFromChange'

const chartTypes = ['Pie', 'Radar', 'Area']

// seperate from the route because it is also used inside other forms
export const Form = memo(({ autoFocusRef }) => {
  const { chart_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.charts.liveUnique({ where: { chart_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.charts.update({
        where: { chart_id },
        data: { [name]: value },
      })
    },
    [db.charts, chart_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('hello ChartForm', { row, chart_id })

  return (
    <div className="form-container">
      <TextFieldInactive label="ID" name="chart_id" value={row.chart_id} />
      <DropdownFieldSimpleOptions
        label="Chart Type"
        name="chart_type"
        value={row.chart_type ?? ''}
        onChange={onChange}
        options={chartTypes}
        autoFocus
        ref={autoFocusRef}
        validationMessage="Choose what type of chart you want to display"
      />
      <TextField
        label="Title"
        name="title"
        value={row.title}
        onChange={onChange}
      />
      <SwitchField
        label="Years: Current"
        name="years_current"
        value={row.years_current ?? false}
        onChange={onChange}
        validationMessage="The chart shows data of the current year"
      />
      <SwitchField
        label="Years: Previous"
        name="years_previous"
        value={row.years_previous ?? false}
        onChange={onChange}
        validationMessage="The chart shows data of the previous year"
      />
      <TextField
        label="Years: Specific"
        name="years_specific"
        value={row.years_specific}
        type="number"
        onChange={onChange}
        validationMessage="The chart shows data of the specific year entered"
      />
      <TextField
        label="Years: Last X"
        name="years_last_x"
        value={row.years_last_x}
        type="number"
        onChange={onChange}
        validationMessage="The chart shows no more than the last x years (x = value entered)"
      />
      <TextField
        label="Years: Since"
        name="years_since"
        value={row.years_since}
        type="number"
        onChange={onChange}
        validationMessage="The chart shows data since the year entered"
      />
      <TextField
        label="Years: Until"
        name="years_until"
        value={row.years_until}
        type="number"
        onChange={onChange}
        validationMessage="The chart shows data until the year entered"
      />
      <SwitchField
        label="Stack Subjects?"
        name="subjects_stacked"
        value={row.subjects_stacked}
        onChange={onChange}
        validationMessage="If true, subjects graphs will be stacked. If false, they will be drawn covering each other"
      />
      <SwitchField
        label="Draw subjects in separate charts?"
        name="subjects_single"
        value={row.subjects_single}
        onChange={onChange}
        validationMessage="If false, subjects will be drawn in a single graph"
      />
      <SwitchField
        label="Show percent if multiple subjects exist?"
        name="percent"
        value={row.percent}
        onChange={onChange}
        validationMessage="You will see the percentage of avery subject, totalling 100%"
      />
    </div>
  )
})
