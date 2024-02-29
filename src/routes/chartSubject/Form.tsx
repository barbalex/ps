import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import type { InputProps } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions'
import { getValueFromChange } from '../../modules/getValueFromChange'

const chartTables = [
  'subprojects',
  'places',
  'checks',
  'check_values',
  'actions',
  'action_values',
]

// seperate from the route because it is also used inside other forms
export const ChartSubjectForm = memo(({ autoFocusRef }) => {
  const { chart_subject_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.chart_subjects.liveUnique({ where: { chart_subject_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      const valueToUse = name === 'table_level' ? +value : value
      db.chart_subjects.update({
        where: { chart_subject_id },
        data: { [name]: valueToUse },
      })
    },
    [db.chart_subjects, chart_subject_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <TextFieldInactive
        label="ID"
        name="chart_subject_id"
        value={row.chart_subject_id}
      />
      <TextFieldInactive
        label="Account ID"
        name="account_id"
        value={row.account_id}
      />
      <TextFieldInactive
        label="Chart ID"
        name="chart_id"
        value={row.chart_id}
      />
      <DropdownFieldSimpleOptions
        label="Table"
        name="table_name"
        value={row.table_name ?? ''}
        onChange={onChange}
        options={chartTables}
        autoFocus
        ref={autoFocusRef}
        validationMessage="Choose what table to get the data from."
      />
      <RadioGroupField
        label="Level"
        name="table_level"
        list={[1, 2]}
        value={row.table_level ?? ''}
        onChange={onChange}
      />
      <TextField
        label="TODO: table filter"
        name="table_filter"
        value={row.table_filter}
        type="number"
        onChange={onChange}
      />
      <RadioGroupField
        label="Value Source"
        name="value_source"
        list={[
          'row_count',
          'field_count_rows_by_distinct_field_values',
          'field_sum_values',
        ]}
        value={row.value_source ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Value Field"
        name="value_field"
        value={row.value_field}
        onChange={onChange}
        validationMessage="The name of the field."
      />
      <TextField
        label="TODO: Value: Unit"
        name="value_unit"
        value={row.value_unit}
        type="number"
        onChange={onChange}
      />
      <TextField
        label="TODO: Styling"
        name="styling"
        value={row.styling}
        type="number"
        onChange={onChange}
      />
    </div>
  )
})