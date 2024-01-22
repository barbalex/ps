import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { CheckTaxa as CheckTaxon } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createCheckTaxon } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, check_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.check_taxa.liveMany({
        where: { check_id, deleted: false },
        orderBy: { label: 'asc' },
      }),
    [check_id],
  )

  const add = useCallback(async () => {
    const checkTaxon = createCheckTaxon()
    await db.check_taxa.create({
      data: {
        ...checkTaxon,
        check_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks/${check_id}/taxa/${checkTaxon.check_taxon_id}`,
    )
  }, [
    check_id,
    db.check_taxa,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const checkTaxa: CheckTaxon[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Check Taxa" addRow={add} tableName="check taxon" />
      <div className="list-container">
        {checkTaxa.map(({ check_taxon_id, label }) => (
          <Row
            key={check_taxon_id}
            label={label}
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
              place_id2 ? `/places/${place_id2}` : ''
            }/checks/${check_id}/taxa/${check_taxon_id}`}
          />
        ))}
      </div>
    </div>
  )
}
