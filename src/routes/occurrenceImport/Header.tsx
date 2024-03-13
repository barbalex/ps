import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createOccurrenceImport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, occurrence_import_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `projects/${project_id}/subprojects/${subproject_id}/occurrence-imports`

  const addRow = useCallback(async () => {
    const data = createOccurrenceImport({ subproject_id })
    await db.occurrence_imports.create({ data })
    navigate(`${baseUrl}/${data.occurrence_import_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db.occurrence_imports, navigate, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.occurrence_imports.delete({
      where: { occurrence_import_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.occurrence_imports, navigate, occurrence_import_id])

  const toNext = useCallback(async () => {
    const occurrenceImports = await db.occurrence_imports.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = occurrenceImports.length
    const index = occurrenceImports.findIndex(
      (p) => p.occurrence_import_id === occurrence_import_id,
    )
    const next = occurrenceImports[(index + 1) % len]
    navigate(`${baseUrl}/${next.occurrence_import_id}`)
  }, [baseUrl, db.occurrence_imports, navigate, occurrence_import_id])

  const toPrevious = useCallback(async () => {
    const occurrenceImports = await db.occurrence_imports.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = occurrenceImports.length
    const index = occurrenceImports.findIndex(
      (p) => p.occurrence_import_id === occurrence_import_id,
    )
    const previous = occurrenceImports[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.occurrence_import_id}`)
  }, [baseUrl, db.occurrence_imports, navigate, occurrence_import_id])

  return (
    <FormHeader
      title="Occurrence import"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="occurrence import"
    />
  )
})
