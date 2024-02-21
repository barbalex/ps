import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createCheckValue } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    check_id,
    check_value_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks/${check_id}/values`,
    [check_id, place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const checkValue = createCheckValue()
    await db.check_values.create({
      data: {
        ...checkValue,
        check_id,
      },
    })
    navigate(`${baseUrl}/${checkValue.check_value_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, check_id, db.check_values, navigate])

  const deleteRow = useCallback(async () => {
    await db.check_values.delete({
      where: {
        check_value_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, check_value_id, db.check_values, navigate])

  const toNext = useCallback(async () => {
    const checkValues = await db.check_values.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === check_value_id,
    )
    const next = checkValues[(index + 1) % len]
    navigate(`${baseUrl}/${next.check_value_id}`)
  }, [baseUrl, check_id, check_value_id, db.check_values, navigate])

  const toPrevious = useCallback(async () => {
    const checkValues = await db.check_values.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === check_value_id,
    )
    const previous = checkValues[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.check_value_id}`)
  }, [baseUrl, check_id, check_value_id, db.check_values, navigate])

  return (
    <FormHeader
      title="Check value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="check value"
    />
  )
})
