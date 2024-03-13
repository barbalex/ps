import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { createSubproject } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  // get projects.subproject_name_singular to name the table
  const { results: project = {} } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const nameSingular = project?.subproject_name_singular ?? 'Subproject'
  const nameSingularLower = nameSingular.toLowerCase()

  const baseUrl = `/projects/${project_id}/subprojects`

  const addRow = useCallback(async () => {
    const data = await createSubproject({ db, project_id })
    await db.subprojects.create({ data })
    navigate(`${baseUrl}/${data.subproject_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.subprojects.delete({
      where: { subproject_id },
    })
    navigate('..')
  }, [baseUrl, db.subprojects, navigate, subproject_id])

  const toNext = useCallback(async () => {
    const subprojects = await db.subprojects.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojects.length
    const index = subprojects.findIndex(
      (p) => p.subproject_id === subproject_id,
    )
    const next = subprojects[(index + 1) % len]
    navigate(`${baseUrl}/${next.subproject_id}`)
  }, [baseUrl, db.subprojects, navigate, project_id, subproject_id])

  const toPrevious = useCallback(async () => {
    const subprojects = await db.subprojects.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojects.length
    const index = subprojects.findIndex(
      (p) => p.subproject_id === subproject_id,
    )
    const previous = subprojects[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.subproject_id}`)
  }, [baseUrl, db.subprojects, navigate, project_id, subproject_id])

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
