import { useCallback, useMemo, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createCheckTaxon } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    check_id,
    check_taxon_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks/${check_id}/taxa`,
    [check_id, place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const checkTaxon = createCheckTaxon()
    await db.check_taxa.create({
      data: {
        ...checkTaxon,
        check_id,
      },
    })
    navigate(`${baseUrl}/${checkTaxon.check_taxon_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, check_id, db.check_taxa, navigate])

  const deleteRow = useCallback(async () => {
    await db.check_taxa.delete({
      where: {
        check_taxon_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, check_taxon_id, db.check_taxa, navigate])

  const toNext = useCallback(async () => {
    const checkTaxa = await db.check_taxa.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const next = checkTaxa[(index + 1) % len]
    navigate(`${baseUrl}/${next.check_taxon_id}`)
  }, [baseUrl, check_id, check_taxon_id, db.check_taxa, navigate])

  const toPrevious = useCallback(async () => {
    const checkTaxa = await db.check_taxa.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const previous = checkTaxa[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.check_taxon_id}`)
  }, [baseUrl, check_id, check_taxon_id, db.check_taxa, navigate])

  return (
    <FormHeader
      title="Check taxon"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="check taxon"
    />
  )
})
