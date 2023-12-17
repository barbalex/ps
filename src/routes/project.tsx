import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'
import { Form, Input, Radio, Switch } from 'antd'

import { Projects as Project } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()
  const { project_id } = useParams()
  const { results } = useLiveQuery(
    () => db.projects.liveUnique({ where: { project_id } }),
    [project_id],
  )

  const addRow = async () => {
    await db.projects.create({
      data: {
        project_id: uuidv7(),
        type: 'species',
        subproject_name_singular: 'Art',
        subproject_name_plural: 'Arten',
        values_on_multiple_levels: 'first',
        multiple_action_values_on_same_level: 'all',
        multiple_check_values_on_same_level: 'last',
        files_active: true,
      },
    })
  }

  const deleteRow = async () => {
    await db.projects.delete({
      where: {
        project_id,
      },
    })
  }

  const row: Project = results

  console.log('project, row:', { project_id, row })

  const onValuesChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (changedValues: any) => {
      db.projects.update({
        where: { project_id },
        data: changedValues,
      })
    },
    [db.projects, project_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={addRow}>
          Add
        </button>
        <button className="button" onClick={deleteRow}>
          Delete
        </button>
      </div>

      <Form
        // key needed to force the form to update when the route changes
        key={JSON.stringify(row)}
        name={`project-${project_id}`}
        colon={false}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        labelWrap={true}
        layout="horizontal"
        initialValues={row}
        onValuesChange={onValuesChange}
        autoComplete="off"
      >
        <Form.Item label="ID" name="project_id">
          <span>{row.project_id}</span>
        </Form.Item>
        <Form.Item label="Name" name="name">
          <Input value={row.name} />
        </Form.Item>
        <Form.Item label="Type" name="type">
          <Radio.Group value="horizontal">
            <Radio.Button value="species">Species</Radio.Button>
            <Radio.Button value="biotope">Biotope</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Name of subproject (singular)"
          name="subproject_name_singular"
        >
          <Input value={row.subproject_name_singular} />
        </Form.Item>
        <Form.Item
          label="Name of subproject (plural)"
          name="subproject_name_plural"
        >
          <Input value={row.subproject_name_plural} />
        </Form.Item>
        <Form.Item
          label="Order subproject by (field name)"
          name="subproject_order_by"
        >
          <Input value={row.subproject_order_by} />
        </Form.Item>
        <Form.Item
          label="Value(s) to use when Values exist on multiple place levels"
          name="values_on_multiple_levels"
        >
          <Radio.Group value="horizontal">
            <Radio.Button value="first">first level</Radio.Button>
            <Radio.Button value="second">second level</Radio.Button>
            <Radio.Button value="all">all levels</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Value(s) to use when multiple action Values exist on the same place level"
          name="multiple_action_values_on_same_level"
        >
          <Radio.Group value="horizontal">
            <Radio.Button value="first">first</Radio.Button>
            <Radio.Button value="last">last</Radio.Button>
            <Radio.Button value="all">all</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Value(s) to use when multiple check Values exist on the same place level"
          name="multiple_check_values_on_same_level"
        >
          <Radio.Group value="horizontal">
            <Radio.Button value="first">first</Radio.Button>
            <Radio.Button value="last">last</Radio.Button>
            <Radio.Button value="all">all</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="files_active"
          label="activate files"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </div>
  )
}
