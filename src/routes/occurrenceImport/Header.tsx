import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createOccurrenceImport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { subproject_id, occurrence_import_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = createOccurrenceImport({ subproject_id })
    await db.occurrence_imports.create({ data })
    navigate({
      pathname: data.occurrence_import_id,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db.occurrence_imports,
    navigate,
    searchParams,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.occurrence_imports.delete({
      where: { occurrence_import_id },
    })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.occurrence_imports, navigate, occurrence_import_id, searchParams])

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
    navigate({
      pathname: `../${next.occurrence_import_id}`,
      search: searchParams.toString(),
    })
  }, [db.occurrence_imports, navigate, occurrence_import_id, searchParams])

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
    navigate({
      pathname: `../${previous.occurrence_import_id}`,
      search: searchParams.toString(),
    })
  }, [db.occurrence_imports, navigate, occurrence_import_id, searchParams])

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
