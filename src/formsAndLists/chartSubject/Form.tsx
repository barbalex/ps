import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Section } from '../../components/shared/Section.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Table } from './Table.tsx'
import { Level } from './Level.tsx'
import { ValueSource } from './ValueSource.tsx'
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

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM chart_subjects WHERE chart_subject_id = $1`,
    [chartSubjectId],
  )
  const row: ChartSubjects = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(
      `UPDATE chart_subjects SET ${name} = $1 WHERE chart_subject_id = $2`,
      [value, chartSubjectId],
    )
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
        label="Name"
        name="name"
        value={row.name}
        onChange={onChange}
      />
      <Section title="Data">
        <Table onChange={onChange} row={row} ref={autoFocusRef} />
        <Level onChange={onChange} row={row} />
        <TextField
          label="TODO: table filter"
          name="table_filter"
          value={row.table_filter}
          type="number"
          onChange={onChange}
        />
        <ValueSource onChange={onChange} row={row} />
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
}
