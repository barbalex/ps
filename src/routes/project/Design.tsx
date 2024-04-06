import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Label, Divider } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { CheckboxField } from '../../components/shared/CheckboxField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { LabelBy } from '../../components/shared/LabelBy'
import { FieldList } from '../../components/shared/FieldList'
import { SwitchField } from '../../components/shared/SwitchField'

const labelStyle = {
  color: 'grey',
  fontWeight: 700,
}

export const Design = () => {
  const { project_id } = useParams()

  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser.email } }),
  )
  const designing = appState?.designing ?? false

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.projects.update({
        where: { project_id },
        data: { [name]: value },
      })
    },
    [db.projects, project_id],
  )

  if (!row) return null
  if (!designing) return null

  return (
    <div className="form-container" role="tabpanel" aria-labelledby="design">
      <Label style={labelStyle}>Project configuration</Label>
      <RadioGroupField
        label="Type"
        name="type"
        list={['species', 'biotope']}
        value={row.type ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Name of subproject (singular)"
        name="subproject_name_singular"
        value={row.subproject_name_singular ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Name of subproject (plural)"
        name="subproject_name_plural"
        value={row.subproject_name_plural ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Order subproject by (field name)"
        name="subproject_order_by"
        value={row.subproject_order_by ?? ''}
        onChange={onChange}
      />
      <LabelBy
        label="Goal reports labelled by"
        name="goal_reports_label_by"
        table="goal_reports"
        value={row.goal_reports_label_by ?? ''}
        onChange={onChange}
        extraFieldNames={['id']}
      />
      <LabelBy
        label="Places labelled by"
        name="places_label_by"
        table="places"
        value={row.places_label_by ?? ''}
        onChange={onChange}
        extraFieldNames={['id', 'level']}
      />
      <FieldList
        label="Places ordered by"
        name="places_order_by"
        table="projects"
        fieldsTable="places"
        id={project_id}
        valueArray={row.places_order_by ?? []}
      />
      <Divider />
      <Label>{`Value(s) to use in reports when:`}</Label>
      <RadioGroupField
        label="...values exist on multiple place levels"
        name="values_on_multiple_levels"
        list={['first', 'second', 'all']}
        value={row.values_on_multiple_levels ?? ''}
        onChange={onChange}
      />
      <RadioGroupField
        label="...multiple action values exist on the same place level"
        name="multiple_action_values_on_same_level"
        list={['first', 'last', 'all']}
        value={row.multiple_action_values_on_same_level ?? ''}
        onChange={onChange}
      />
      <RadioGroupField
        label="...multiple check Values exist on the same place level"
        name="multiple_check_values_on_same_level"
        list={['first', 'last', 'all']}
        value={row.multiple_check_values_on_same_level ?? ''}
        onChange={onChange}
      />
      <Divider />
      <div className="checkboxfield-list">
        <SwitchField
          label="Save files locally to be available offline"
          name="files_offline"
          value={row.files_offline}
          onChange={onChange}
        />
        <Label>Enable uploading files to:</Label>
        <CheckboxField
          label="Projects"
          name="files_active_projects"
          value={row.files_active_projects ?? false}
          onChange={onChange}
        />
        <CheckboxField
          label="Subprojects"
          name="files_active_subprojects"
          value={row.files_active_subprojects ?? false}
          onChange={onChange}
        />
        <CheckboxField
          label="Places"
          name="files_active_places"
          value={row.files_active_places ?? false}
          onChange={onChange}
        />
        <CheckboxField
          label="Actions"
          name="files_active_actions"
          value={row.files_active_actions ?? false}
          onChange={onChange}
        />
        <CheckboxField
          label="Checks"
          name="files_active_checks"
          value={row.files_active_checks ?? false}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
