import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { createChart } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, place_id, place_id2, chart_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
    subproject_id ? `/subprojects/${subproject_id}` : ''
  }${place_id ? `/places/${place_id}` : ''}${
    place_id2 ? `/places/${place_id2}` : ''
  }/charts`

  const addRow = useCallback(async () => {
    const idToAdd = place_id2
      ? { place_id2 }
      : place_id
      ? { place_id }
      : subproject_id
      ? { subproject_id }
      : { project_id }
    const data = createChart(idToAdd)
    await db.charts.create({ data })
    navigate(`${baseUrl}/${data.chart_id}`)
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    baseUrl,
    db.charts,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.charts.delete({ where: { chart_id } })
    navigate(baseUrl)
  }, [baseUrl, db.charts, chart_id, navigate])

  const where = useMemo(() => {
    const where = { deleted: false }
    if (place_id2) {
      where.place_id2 = place_id2
    } else if (place_id) {
      where.place_id = place_id
    } else if (subproject_id) {
      where.subproject_id = subproject_id
    } else if (project_id) {
      where.project_id = project_id
    }
    return where
  }, [place_id, place_id2, project_id, subproject_id])

  const toNext = useCallback(async () => {
    const charts = await db.charts.findMany({
      where,
      orderBy: { label: 'asc' },
    })
    const len = charts.length
    const index = charts.findIndex((p) => p.chart_id === chart_id)
    const next = charts[(index + 1) % len]
    navigate(`${baseUrl}/${next.chart_id}`)
  }, [db.charts, where, navigate, baseUrl, chart_id])

  const toPrevious = useCallback(async () => {
    const charts = await db.charts.findMany({
      where,
      orderBy: { label: 'asc' },
    })
    const len = charts.length
    const index = charts.findIndex((p) => p.chart_id === chart_id)
    const previous = charts[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.chart_id}`)
  }, [db.charts, where, navigate, baseUrl, chart_id])

  return (
    <FormHeader
      title="Chart"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="chart"
    />
  )
})
