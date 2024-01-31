import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createActionValue } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

import '../../form.css'

export const FormHeaderComponent = memo(({ autoFocusRef }) => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    action_value_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/values`,
    [action_id, place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const actionValue = createActionValue()
    await db.action_values.create({
      data: {
        ...actionValue,
        action_id,
      },
    })
    navigate(`${baseUrl}/${actionValue.action_value_id}`)
    autoFocusRef.current?.focus()
  }, [action_id, autoFocusRef, baseUrl, db.action_values, navigate])

  const deleteRow = useCallback(async () => {
    await db.action_values.delete({
      where: {
        action_value_id,
      },
    })
    navigate(baseUrl)
  }, [action_value_id, baseUrl, db.action_values, navigate])

  const toNext = useCallback(async () => {
    const actionValues = await db.action_values.findMany({
      where: { deleted: false, action_id },
      orderBy: { label: 'asc' },
    })
    const len = actionValues.length
    const index = actionValues.findIndex(
      (p) => p.action_value_id === action_value_id,
    )
    const next = actionValues[(index + 1) % len]
    navigate(`${baseUrl}/${next.action_value_id}`)
  }, [action_id, action_value_id, baseUrl, db.action_values, navigate])

  const toPrevious = useCallback(async () => {
    const actionValues = await db.action_values.findMany({
      where: { deleted: false, action_id },
      orderBy: { label: 'asc' },
    })
    const len = actionValues.length
    const index = actionValues.findIndex(
      (p) => p.action_value_id === action_value_id,
    )
    const previous = actionValues[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.action_value_id}`)
  }, [action_id, action_value_id, baseUrl, db.action_values, navigate])

  return (
    <FormHeader
      title="Action Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="action value"
    />
  )
})
