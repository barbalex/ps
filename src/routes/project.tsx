import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Radio, Switch, Button } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'

import { Projects as Project } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.projects.liveUnique({ where: { project_id } }),
    [project_id],
  )

  const addRow = async () => {
    const project_id = uuidv7()
    await db.projects.create({
      data: {
        project_id,
        type: 'species',
        subproject_name_singular: 'Art',
        subproject_name_plural: 'Arten',
        values_on_multiple_levels: 'first',
        multiple_action_values_on_same_level: 'all',
        multiple_check_values_on_same_level: 'last',
        files_active: true,
      },
    })
    navigate(`/projects/${project_id}`)
  }

  const deleteRow = async () => {
    await db.projects.delete({
      where: {
        project_id,
      },
    })
  }

  const row: Project = results

  const [form] = Form.useForm()

  const onValuesChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (changedValues: any) => {
      console.log('changedValues', changedValues)
      db.projects.update({
        where: { project_id },
        data: changedValues,
      })
    },
    [db.projects, project_id],
  )

  const onFieldsChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (changedFields: any) => {
      console.log('changedFields', changedFields)
    },
    [],
  )

  const onFinish = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (values: any) => {
      console.log('Finish:', values)
      db.projects.update({
        where: { project_id },
        data: values,
      })
    },
    [db.projects, project_id],
  )

  const onBlur = useCallback(
    (e) => {
      console.log('onBlur', e)
      form.submit()
      e.preventDefault()
    },
    [form],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <div className="controls">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={addRow}
          title="Add new project"
        />
        <Button
          type="primary"
          icon={<MinusOutlined />}
          size="large"
          onClick={deleteRow}
          title="Delete project"
        />
      </div>

      <Form
        // key needed to force the form to update when the route changes
        key={JSON.stringify(row)}
        name={`project-${project_id}`}
        form={form}
        colon={false}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        labelWrap={true}
        layout="horizontal"
        initialValues={row}
        onValuesChange={onValuesChange}
        onFieldsChange={onFieldsChange}
        onFinish={onFinish}
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
          <Input value={row.subproject_order_by} onBlur={onBlur} />
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
