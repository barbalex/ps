import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { createActionQuantity } from '../../modules/createRows.ts'
import { Header } from './Header.tsx'
import { ActionForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { ActionQuantityInline } from '../actionQuantity/Inline.tsx'
import { addOperationAtom, designingAtom } from '../../store.ts'
import type Actions from '../../models/public/Actions.ts'

import '../../form.css'

const { Button, Tooltip } = fluentUiReactComponents

export const ActionWithQuantities = ({ from }) => {
  const { actionId, projectId, placeId2 } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [isDesigning] = useAtom(designingAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM actions WHERE action_id = $1`, [
    actionId,
  ])
  const row: Actions | undefined = res?.rows?.[0]

  const quantitiesRes = useLiveQuery(
    `SELECT action_quantity_id FROM action_quantities WHERE action_id = $1 ORDER BY action_quantity_id`,
    [actionId],
  )
  const quantities = quantitiesRes?.rows ?? []

  const placeLevelRes = useLiveQuery(
    `SELECT action_quantities FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = placeLevelRes?.rows?.[0]
  const showQuantities = isDesigning || placeLevel?.action_quantities !== false

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return
    try {
      await db.query(`UPDATE actions SET ${name} = $1 WHERE action_id = $2`, [
        value,
        actionId,
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
      table: 'actions',
      rowIdName: 'action_id',
      rowId: actionId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const addQuantity = async () => {
    await createActionQuantity({ actionId, projectId })
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
                  <div key={q.action_quantity_id}>
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
                    <ActionQuantityInline
                      actionQuantityId={q.action_quantity_id}
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
          </>
        ) : (
          <NotFound
            table={formatMessage({ id: 'upa2nh', defaultMessage: 'Massnahme' })}
            id={actionId}
          />
        )}
      </div>
    </div>
  )
}
