import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { createChartSubject } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    chart_id,
    chart_subject_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
    subproject_id ? `/subprojects/${subproject_id}` : ''
  }${place_id ? `/places/${place_id}` : ''}${
    place_id2 ? `/places/${place_id2}` : ''
  }/charts/${chart_subject_id}/subjects`

  const addRow = useCallback(async () => {
    const data = createChartSubject({ chart_id })
    await db.chart_subjects.create({ data })
    navigate(`${baseUrl}/${data.chart_subject_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, chart_id, db.chart_subjects, navigate])

  const deleteRow = useCallback(async () => {
    await db.chart_subjects.delete({ where: { chart_subject_id } })
    navigate(baseUrl)
  }, [db.chart_subjects, chart_subject_id, navigate, baseUrl])

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
    const chartSubjects = await db.chart_subjects.findMany({
      where,
      orderBy: { label: 'asc' },
    })
    const len = chartSubjects.length
    const index = chartSubjects.findIndex(
      (p) => p.chart_subject_id === chart_subject_id,
    )
    const next = chartSubjects[(index + 1) % len]
    navigate(`${baseUrl}/${next.chart_subject_id}`)
  }, [db.chart_subjects, where, navigate, baseUrl, chart_subject_id])

  const toPrevious = useCallback(async () => {
    const chartSubjects = await db.chart_subjects.findMany({
      where,
      orderBy: { label: 'asc' },
    })
    const len = chartSubjects.length
    const index = chartSubjects.findIndex(
      (p) => p.chart_subject_id === chart_subject_id,
    )
    const previous = chartSubjects[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.chart_subject_id}`)
  }, [db.chart_subjects, where, navigate, baseUrl, chart_subject_id])

  return (
    <FormHeader
      title="Chart Subject"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="chart subject"
    />
  )
})
