import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Form, useParams } from 'react-router-dom'
import FormControl from '@mui/material/FormControl'

import { Projects as Project } from '../../../generated/client'
import { TextField } from '../components/shared/TextField'

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
      db.projects.update({
        where: { project_id },
        data: { [event.target.name]: event.target.value },
      })
    },
    [db.projects, project_id],
  )

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
      {/* <TextField name="name" label="Name" value={row.name} onBlur={onBlur} /> */}
    </div>
  )
}
