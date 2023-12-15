import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'
import { Form, Input } from 'antd'

import { Projects as Project } from '../../../generated/client'
// import { TextField } from '../components/shared/TextFieldMui'
// import { TextField } from '../components/shared/TextFieldAnt'

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
      <div>{`Project with id ${row?.project_id ?? ''}`}</div>
      <Form
        name="projectForm"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={row}
        onValuesChange={onValuesChange}
        autoComplete="off"
      >
        <Form.Item label="Name" name="name">
          <Input value={row.name} />
        </Form.Item>
      </Form>
    </div>
  )
}
