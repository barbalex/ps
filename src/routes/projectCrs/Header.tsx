import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createProjectCrs } from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, project_crs_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createProjectCrs({ project_id })
    await db.project_crs.create({ data })
    navigate({
      pathname: `../${data.project_crs_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.project_crs, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.project_crs.delete({ where: { project_crs_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.project_crs, navigate, project_crs_id, searchParams])

  const toNext = useCallback(async () => {
    const projectCrs = await db.project_crs.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectCrs.length
    const index = projectCrs.findIndex(
      (p) => p.project_crs_id === project_crs_id,
    )
    const next = projectCrs[(index + 1) % len]
    navigate({
      pathname: `../${next.project_crs_id}`,
      search: searchParams.toString(),
    })
  }, [db.project_crs, navigate, project_crs_id, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const projectCrs = await db.project_crs.findMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectCrs.length
    const index = projectCrs.findIndex(
      (p) => p.project_crs_id === project_crs_id,
    )
    const previous = projectCrs[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.project_crs_id}`,
      search: searchParams.toString(),
    })
  }, [db.project_crs, navigate, project_crs_id, project_id, searchParams])

  return (
    <FormHeader
      title="CRS"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="project_crs"
    />
  )
})
