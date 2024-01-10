import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { Label, Divider } from '@fluentui/react-components'

import { Projects as Project } from '../../../generated/client'
import { createProject } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { CheckboxField } from '../components/shared/CheckboxField'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'
import { PlacesLabelBy } from './place/PlacesLabelBy'
import { FieldList } from '../components/shared/FieldList'

import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.projects.liveUnique({ where: { project_id } }),
    [project_id],
  )

  const addRow = useCallback(async () => {
    const data = await createProject({ db })
    await db.projects.create({ data })
    navigate(`/projects/${data.project_id}`)
    autoFocusRef.current?.focus()
  }, [db, navigate])

  const deleteRow = useCallback(async () => {
    await db.projects.delete({
      where: {
        project_id,
      },
    })
    navigate(`/projects`)
  }, [db.projects, navigate, project_id])

  const toNext = useCallback(async () => {
    const projects = await db.projects.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = projects.length
    const index = projects.findIndex((p) => p.project_id === project_id)
    const next = projects[(index + 1) % len]
    navigate(`/projects/${next.project_id}`)
  }, [db.projects, navigate, project_id])

  const toPrevious = useCallback(async () => {
    const projects = await db.projects.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = projects.length
    const index = projects.findIndex((p) => p.project_id === project_id)
    const previous = projects[(index + len - 1) % len]
    navigate(`/projects/${previous.project_id}`)
  }, [db.projects, navigate, project_id])

  const row: Project = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.projects.update({
        where: { project_id },
        data: { [name]: value },
      })
    },
    [db.projects, project_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('project, row:', row)

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="project"
      />
      <TextFieldInactive label="ID" name="project_id" value={row.project_id} />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
      />
      <Jsonb
        table="projects"
        idField="project_id"
        id={row.project_id}
        data={row.data ?? {}}
      />
      <Divider />
      <Label>Project configuration</Label>
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
      <PlacesLabelBy value={row.places_label_by ?? ''} onChange={onChange} />
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
        <Label>Enable uploading files to:</Label>
        <CheckboxField
          label="Projects"
          name="files_active_projects"
          value={row.files_active_projects ?? false}
          onChange={onChange}
        />
        <CheckboxField
          label="Project reports"
          name="files_active_projects_reports"
          value={row.files_active_projects_reports ?? false}
          onChange={onChange}
        />
        <CheckboxField
          label="Subprojects"
          name="files_active_subprojects"
          value={row.files_active_subprojects ?? false}
          onChange={onChange}
        />
        <CheckboxField
          label="Subproject reports"
          name="files_active_subproject_reports"
          value={row.files_active_subproject_reports ?? false}
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
        <CheckboxField
          label="Check reports"
          name="files_active_check_reports"
          value={row.files_active_check_reports ?? false}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
