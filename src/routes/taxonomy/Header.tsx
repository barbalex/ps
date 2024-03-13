import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { createTaxonomy } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, taxonomy_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `/projects/${project_id}/taxonomies`

  const addRow = useCallback(async () => {
    const data = await createTaxonomy({ db, project_id })
    await db.taxonomies.create({ data })
    navigate(`${baseUrl}/${data.taxonomy_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.taxonomies.delete({
      where: { taxonomy_id },
    })
    navigate('..')
  }, [baseUrl, db.taxonomies, navigate, taxonomy_id])

  const toNext = useCallback(async () => {
    const taxonomies = await db.taxonomies.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomy_id)
    const next = taxonomies[(index + 1) % len]
    navigate(`${baseUrl}/${next.taxonomy_id}`)
  }, [baseUrl, db.taxonomies, navigate, project_id, taxonomy_id])

  const toPrevious = useCallback(async () => {
    const taxonomies = await db.taxonomies.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = taxonomies.length
    const index = taxonomies.findIndex((p) => p.taxonomy_id === taxonomy_id)
    const previous = taxonomies[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.taxonomy_id}`)
  }, [baseUrl, db.taxonomies, navigate, project_id, taxonomy_id])

  return (
    <FormHeader
      title="Taxonomy"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="taxonomy"
    />
  )
})
