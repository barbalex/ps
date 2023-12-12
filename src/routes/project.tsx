import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'
import { Form, Button } from 'antd'

import { Projects as Project } from '../../../generated/client'
// import { TextField } from '../components/shared/TextFieldMui'
import { TextField } from '../components/shared/TextFieldAnt'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()
  const { project_id } = useParams()
  const { results } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )

  const addRow = async () => {
    await db.projects.create({
      data: {
        project_id: uuidv7(),
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

  const onBlur = useCallback(
    (event) => {
      console.log('project, onBlur', { event, target: event.target })

      db.projects.update({
        where: { project_id },
        data: { [event.target.name]: event.target.value },
      })
    },
    [db.projects, project_id],
  )

  const onFinish = (values: any) => {
    console.log('onFinish', { values, project_id })
    db.projects.update({
      where: { project_id },
      data: values,
    })
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  console.log('project, row:', row)

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addRow}>
          Add
        </button>
        <button className="button" onClick={deleteRow}>
          Delete
        </button>
      </div>
      <div>{`Project with id ${row?.project_id ?? ''}`}</div>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={row}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <TextField name="name" label="Name" value={row.name} onBlur={onBlur} />
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
