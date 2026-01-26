import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { Label, Divider } from '@fluentui/react-components'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../../components/shared/TextFieldInactive.tsx'
import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'
// import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions'
import { CheckboxField } from '../../../components/shared/CheckboxField.tsx'
import { LabelBy } from '../../../components/shared/LabelBy.tsx'
import { FieldList } from '../../../components/shared/FieldList/index.tsx'
import { SwitchField } from '../../../components/shared/SwitchField.tsx'
import { Type } from './Type.tsx'
import { Loading } from '../../../components/shared/Loading.tsx'
import { NotFound } from '../../../components/NotFound.tsx'
import { FormHeader } from '../../../components/FormHeader/index.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../../store.ts'
import type Projects from '../../../models/public/Projects.ts'

export const Configuration = ({ from }) => {
  const { projectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const row: Projects | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(`UPDATE projects SET ${name} = $1 WHERE project_id = $2`, [
        value,
        projectId,
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
    // add task to update server and rollback PGlite in case of error
    // https://tanstack.com/db/latest/docs/collections/electric-collection?
    // TODO: use this everywhere
    addOperation({
      table: 'projects',
      rowIdName: 'project_id',
      rowId: projectId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Project" id={projectId} />
  }

  return (
    <div className="form-outer-container">
      <FormHeader title="Project configuration" />
      <div className="form-container" role="tabpanel" aria-labelledby="form">
        <Type row={row} onChange={onChange} validations={validations} />
        <TextField
          label="Name of subproject (singular)"
          name="subproject_name_singular"
          value={row.subproject_name_singular ?? ''}
          onChange={onChange}
          validationState={validations?.subproject_name_singular?.state}
          validationMessage={validations?.subproject_name_singular?.message}
        />
        <TextField
          label="Name of subproject (plural)"
          name="subproject_name_plural"
          value={row.subproject_name_plural ?? ''}
          onChange={onChange}
          validationState={validations?.subproject_name_plural?.state}
          validationMessage={validations?.subproject_name_plural?.message}
        />
        <TextField
          label="Order subproject by (field name)"
          name="subproject_order_by"
          value={row.subproject_order_by ?? ''}
          onChange={onChange}
          validationState={validations?.subproject_order_by?.state}
          validationMessage={validations?.subproject_order_by?.message}
        />
        <LabelBy
          label="Goal reports labelled by"
          name="goal_reports_label_by"
          table="goal_reports"
          value={row.goal_reports_label_by ?? ''}
          onChange={onChange}
          extraFieldNames={['id']}
          from={from}
          validationState={validations?.goal_reports_label_by?.state}
          validationMessage={validations?.goal_reports_label_by?.message}
        />
        <LabelBy
          label="Places labelled by"
          name="places_label_by"
          table="places"
          value={row.places_label_by ?? ''}
          onChange={onChange}
          extraFieldNames={['id', 'level']}
          from={from}
          validationState={validations?.places_label_by?.state}
          validationMessage={validations?.places_label_by?.message}
        />
        <FieldList
          label="Places ordered by"
          name="places_order_by"
          table="projects"
          fieldsTable="places"
          id={projectId}
          valueArray={row.places_order_by ?? []}
          from={from}
        />
        <TextFieldInactive
          label="Map Presentation CRS"
          name="map_presentation_crs"
          value={row.map_presentation_crs ?? 'EPSG:4326'}
          validationMessage="Choose a CRS in the CRS List"
        />
        <Divider />
        <Label>{`Value(s) to use in reports when:`}</Label>
        <RadioGroupField
          label="...values exist on multiple place levels"
          name="values_on_multiple_levels"
          list={['first', 'second', 'all']}
          value={row.values_on_multiple_levels ?? ''}
          onChange={onChange}
          validationState={validations?.values_on_multiple_levels?.state}
          validationMessage={validations?.values_on_multiple_levels?.message}
        />
        <RadioGroupField
          label="...multiple action values exist on the same place level"
          name="multiple_action_values_on_same_level"
          list={['first', 'last', 'all']}
          value={row.multiple_action_values_on_same_level ?? ''}
          onChange={onChange}
          validationState={
            validations.multiple_action_values_on_same_level?.state
          }
          validationMessage={
            validations.multiple_action_values_on_same_level?.message
          }
        />
        <RadioGroupField
          label="...multiple check Values exist on the same place level"
          name="multiple_check_values_on_same_level"
          list={['first', 'last', 'all']}
          value={row.multiple_check_values_on_same_level ?? ''}
          onChange={onChange}
          validationState={
            validations.multiple_check_values_on_same_level?.state
          }
          validationMessage={
            validations.multiple_check_values_on_same_level?.message
          }
        />
        <Divider />
        <div className="checkboxfield-list">
          <SwitchField
            label="Save files locally to be available offline"
            name="files_offline"
            value={row.files_offline}
            onChange={onChange}
            validationState={validations?.files_offline?.state}
            validationMessage={validations?.files_offline?.message}
          />
          <Label>Enable uploading files to:</Label>
          <CheckboxField
            label="Projects"
            name="files_active_projects"
            value={row.files_active_projects ?? false}
            onChange={onChange}
            validationState={validations?.files_active_projects?.state}
            validationMessage={validations?.files_active_projects?.message}
          />
          <CheckboxField
            label="Subprojects"
            name="files_active_subprojects"
            value={row.files_active_subprojects ?? false}
            onChange={onChange}
            validationState={validations?.files_active_subprojects?.state}
            validationMessage={validations?.files_active_subprojects?.message}
          />
          <CheckboxField
            label="Places"
            name="files_active_places"
            value={row.files_active_places ?? false}
            onChange={onChange}
            validationState={validations?.files_active_places?.state}
            validationMessage={validations?.files_active_places?.message}
          />
          <CheckboxField
            label="Actions"
            name="files_active_actions"
            value={row.files_active_actions ?? false}
            onChange={onChange}
            validationState={validations?.files_active_actions?.state}
            validationMessage={validations?.files_active_actions?.message}
          />
          <CheckboxField
            label="Checks"
            name="files_active_checks"
            value={row.files_active_checks ?? false}
            onChange={onChange}
            validationState={validations?.files_active_checks?.state}
            validationMessage={validations?.files_active_checks?.message}
          />
        </div>
      </div>
    </div>
  )
}
