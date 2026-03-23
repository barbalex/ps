import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { createCheckQuantity } from '../../modules/createRows.ts'
import { createCheckTaxon } from '../../modules/createRows.ts'
import { Header } from './Header.tsx'
import { CheckForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { CheckQuantityInline } from '../checkQuantity/Inline.tsx'
import { CheckTaxonInline } from '../checkTaxon/Inline.tsx'
import { addOperationAtom, designingAtom } from '../../store.ts'
import type Checks from '../../models/public/Checks.ts'

import '../../form.css'

const { Button, Tooltip } = fluentUiReactComponents

export const CheckWithAll = ({ from }) => {
  const { checkId, projectId, placeId2 } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [isDesigning] = useAtom(designingAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM checks WHERE check_id = $1`, [
    checkId,
  ])
  const row: Checks | undefined = res?.rows?.[0]

  const quantitiesRes = useLiveQuery(
    `SELECT check_quantity_id FROM check_quantities WHERE check_id = $1 ORDER BY check_quantity_id`,
    [checkId],
  )
  const quantities = quantitiesRes?.rows ?? []

  const taxaRes = useLiveQuery(
    `SELECT check_taxon_id FROM check_taxa WHERE check_id = $1 ORDER BY check_taxon_id`,
    [checkId],
  )
  const taxa = taxaRes?.rows ?? []

  const placeLevelRes = useLiveQuery(
    `SELECT check_quantities, check_quantities_in_check, check_taxa, check_taxa_in_check FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = placeLevelRes?.rows?.[0]
  const quantitiesInCheck = placeLevel?.check_quantities_in_check !== false
  const taxaInCheck = placeLevel?.check_taxa_in_check !== false
  const showQuantities =
    quantitiesInCheck && (isDesigning || placeLevel?.check_quantities !== false)
  const showTaxa =
    taxaInCheck && (isDesigning || placeLevel?.check_taxa !== false)

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return
    try {
      await db.query(`UPDATE checks SET ${name} = $1 WHERE check_id = $2`, [
        value,
        checkId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'checks',
      rowIdName: 'check_id',
      rowId: checkId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const addQuantity = async () => {
    await createCheckQuantity({ checkId })
  }

  const addTaxon = async () => {
    await createCheckTaxon({ checkId })
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        {!res ? (
          <Loading />
        ) : row ? (
          <>
            <Form
              onChange={onChange}
              validations={validations}
              row={row}
              autoFocusRef={autoFocusRef}
              from={from}
            />
            {showQuantities && (
              <Section
                title={formatMessage({
                  id: 'Xuj/Gy',
                  defaultMessage: 'Mengen',
                })}
              >
                {quantities.map((q, i) => (
                  <div key={q.check_quantity_id}>
                    {i > 0 && (
                      <div
                        style={{
                          borderTop: '8px solid rgb(225, 247, 224)',
                          marginLeft: -10,
                          marginRight: -10,
                          marginBottom: 8,
                        }}
                      />
                    )}
                    <CheckQuantityInline
                      checkQuantityId={q.check_quantity_id}
                      projectId={projectId}
                    />
                  </div>
                ))}
                {quantities.length > 0 && (
                  <div
                    style={{
                      borderTop: '8px solid rgb(225, 247, 224)',
                      marginLeft: -10,
                      marginRight: -10,
                    }}
                  />
                )}
                <Tooltip
                  content={formatMessage({
                    id: 'V6iUlF',
                    defaultMessage: 'Menge hinzufügen',
                  })}
                  relationship="label"
                >
                  <Button icon={<FaPlus />} onClick={addQuantity} />
                </Tooltip>
              </Section>
            )}
            {showTaxa && (
              <Section
                title={formatMessage({
                  id: '7sVbg1',
                  defaultMessage: 'Taxa',
                })}
              >
                {taxa.map((t, i) => (
                  <div key={t.check_taxon_id}>
                    {i > 0 && (
                      <div
                        style={{
                          borderTop: '8px solid rgb(225, 247, 224)',
                          marginLeft: -10,
                          marginRight: -10,
                          marginBottom: 8,
                        }}
                      />
                    )}
                    <CheckTaxonInline
                      checkTaxonId={t.check_taxon_id}
                      projectId={projectId}
                    />
                  </div>
                ))}
                {taxa.length > 0 && (
                  <div
                    style={{
                      borderTop: '8px solid rgb(225, 247, 224)',
                      marginLeft: -10,
                      marginRight: -10,
                    }}
                  />
                )}
                <Tooltip
                  content={formatMessage({
                    id: 'jH7LwO',
                    defaultMessage: 'Taxon hinzufügen',
                  })}
                  relationship="label"
                >
                  <Button icon={<FaPlus />} onClick={addTaxon} />
                </Tooltip>
              </Section>
            )}
          </>
        ) : (
          <NotFound
            table="Check"
            id={checkId}
          />
        )}
      </div>
    </div>
  )
}
