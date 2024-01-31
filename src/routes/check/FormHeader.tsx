import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createCheck } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

import '../../form.css'

export const FormHeaderComponent = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, place_id, place_id2, check_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks`,
    [place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const data = await createCheck({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.checks.create({ data })
    navigate(`${baseUrl}/${data.check_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, place_id, place_id2, project_id])

  const deleteRow = useCallback(async () => {
    await db.checks.delete({
      where: {
        check_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, check_id, db.checks, navigate])

  const toNext = useCallback(async () => {
    const checks = await db.checks.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === check_id)
    const next = checks[(index + 1) % len]
    navigate(`${baseUrl}/${next.check_id}`)
  }, [baseUrl, check_id, db.checks, navigate, place_id, place_id2])

  const toPrevious = useCallback(async () => {
    const checks = await db.checks.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = checks.length
    const index = checks.findIndex((p) => p.check_id === check_id)
    const previous = checks[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.check_id}`)
  }, [baseUrl, check_id, db.checks, navigate, place_id, place_id2])

  return (
    <FormHeader
      title="Check"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="check"
    />
  )
})
