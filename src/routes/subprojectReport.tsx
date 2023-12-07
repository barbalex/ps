import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Places as Place } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { subproject_id, subproject_report_id } = useParams()
  const { results } = useLiveQuery(
    db.subproject_reports.liveUnique({ where: { subproject_report_id } }),
  )

  const addItem = async () => {
    await db.subproject_reports.create({
      data: {
        subproject_report_id: uuidv7(),
        subproject_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.subproject_reports.deleteMany()
  }

  const subprojectReport: Place = results

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Subproject Report with id ${
        subprojectReport?.subproject_report_id ?? ''
      }`}</div>
    </div>
  )
}
