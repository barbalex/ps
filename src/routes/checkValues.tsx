import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { CheckValues as CheckValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createCheckValue } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, check_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.check_values.liveMany({ where: { check_id, deleted: false } }),
    [check_id],
  )

  const add = useCallback(async () => {
    const checkValue = createCheckValue()
    await db.check_values.create({
      data: {
        ...checkValue,
        check_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks/${check_id}/values/${checkValue.check_value_id}`,
    )
  }, [
    check_id,
    db.check_values,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const checkValues: CheckValue[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Check Values"
        addRow={add}
        tableName="check value"
      />
      {checkValues.map((checkValue: CheckValue, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/checks/${check_id}/values/${checkValue.check_value_id}`}
          >
            {checkValue.label ?? checkValue.check_value_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
