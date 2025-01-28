import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import type { InputProps } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Section } from '../../components/shared/Section.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import {
  chart_subject_tableSchema as tableSchema,
  chart_subject_value_sourceSchema as valueSourceSchema,
} from '../../generated/client/index.ts'

// separate from the route because it is also used inside other forms
export const ChartSubjectForm = memo(({ autoFocusRef }) => {
  const { chart_subject_id } = useParams()

  const db = usePGlite()
  const { results: row } = useLiveQuery(
    db.chart_subjects.liveUnique({ where: { chart_subject_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.chart_subjects.update({
        where: { chart_subject_id },
        data: { [name]: value },
      })
    },
    [db.chart_subjects, chart_subject_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-container">
      {/* <TextFieldInactive
        label="ID"
        name="chart_subject_id"
        value={row.chart_subject_id}
      /> */}
      <TextField
        label="Name"
        name="name"
        value={row.name}
        onChange={onChange}
      />
      <Section title="Data">
        <DropdownFieldSimpleOptions
          label="Table"
          name="table_name"
          value={row.table_name ?? ''}
          onChange={onChange}
          options={tableSchema?.options ?? []}
          autoFocus
          ref={autoFocusRef}
          validationMessage="Choose what table to get the data from"
        />
        <RadioGroupField
          label="Level"
          name="table_level"
          list={[1, 2]}
          value={row.table_level ?? ''}
          onChange={onChange}
          validationMessage="Level of places and their respective checks and actions"
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
          list={valueSourceSchema?.options ?? []}
          value={row.value_source ?? ''}
          onChange={onChange}
          replaceUnderscoreInLabel={true}
          validationMessage="How to extract the subject's data from the table"
        />
        {row.value_source && row.value_source !== 'count_rows' && (
          <>
            <TextField
              label="Value Field"
              name="value_field"
              value={row.value_field}
              onChange={onChange}
              validationMessage="The name of the field"
            />
            <TextField
              label="TODO: Value: Unit"
              name="value_unit"
              value={row.value_unit}
              type="number"
              onChange={onChange}
            />
          </>
        )}
      </Section>
      <Section title="Display">
        <TextField
          label="Sort"
          name="sort"
          value={row.sort}
          type="number"
          onChange={onChange}
          validationMessage="Subjects are sorted by this value if set. Else by their name"
        />
        <SwitchField
          label="Connect missing data"
          name="connect_nulls"
          value={row.connect_nulls}
          onChange={onChange}
          validationMessage="If true, a line is drawn even when some data points are missing"
        />
      </Section>
      <Section title="Styling">
        <TextField
          label="Stroke"
          name="stroke"
          value={row.stroke}
          type="color"
          onChange={onChange}
        />
        <TextField
          label="Fill"
          name="fill"
          value={row.fill}
          type="color"
          onChange={onChange}
        />
        <SwitchField
          label="Fill is graded"
          name="fill_graded"
          value={row.fill_graded}
          onChange={onChange}
          validationMessage="If true, the area will be filled using a gradient. Can be helpful when multiple Subjects overlap"
        />
      </Section>
    </div>
  )
})
