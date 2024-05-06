import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createSubproject } from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  // get projects.subproject_name_singular to name the table
  const { results: project = {} } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const nameSingular = project?.subproject_name_singular ?? 'Subproject'
  const nameSingularLower = nameSingular.toLowerCase()

  const addRow = useCallback(async () => {
    const data = await createSubproject({ db, project_id })
    await db.subprojects.create({ data })
    navigate({
      pathname: `../${data.subproject_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.subprojects.delete({ where: { subproject_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.subprojects, navigate, subproject_id, searchParams])

  const toNext = useCallback(async () => {
    const subprojects = await db.subprojects.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojects.length
    const index = subprojects.findIndex(
      (p) => p.subproject_id === subproject_id,
    )
    const next = subprojects[(index + 1) % len]
    navigate({
      pathname: `../${next.subproject_id}`,
      search: searchParams.toString(),
    })
  }, [db.subprojects, navigate, project_id, subproject_id, searchParams])

  const toPrevious = useCallback(async () => {
    const subprojects = await db.subprojects.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojects.length
    const index = subprojects.findIndex(
      (p) => p.subproject_id === subproject_id,
    )
    const previous = subprojects[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.subproject_id}`,
      search: searchParams.toString(),
    })
  }, [db.subprojects, navigate, project_id, subproject_id, searchParams])

  return (
    <FormHeader
      title={nameSingular}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName={nameSingularLower}
    />
  )
})
