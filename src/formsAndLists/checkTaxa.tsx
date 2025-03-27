import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createCheckTaxon } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const CheckTaxa = memo(({ from }) => {
  const { checkId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT check_taxon_id, label FROM check_taxa WHERE check_id = $1 ORDER BY label`,
    [checkId],
    'check_taxon_id',
  )
  const isLoading = res === undefined
  const checkTaxa = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createCheckTaxon({ db, checkId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.check_taxon_id,
      params: (prev) => ({ ...prev, checkTaxonId: data.check_taxon_id }),
    })
  }, [checkId, db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Check Taxa"
        nameSingular="Check Taxon"
        tableName="check_taxa"
        isFiltered={false}
        countFiltered={checkTaxa.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {checkTaxa.map(({ check_taxon_id, label }) => (
              <Row
                key={check_taxon_id}
                label={label ?? check_taxon_id}
                to={check_taxon_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
