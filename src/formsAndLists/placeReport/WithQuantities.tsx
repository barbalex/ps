import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { createPlaceReportQuantity } from '../../modules/createRows.ts'
import { Header } from './Header.tsx'
import { PlaceReportForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { PlaceReportQuantityInline } from '../placeReportQuantity/Inline.tsx'
import { addOperationAtom, designingAtom } from '../../store.ts'
import type PlaceReports from '../../models/public/PlaceReports.ts'

import '../../form.css'

const { Button, Tooltip } = fluentUiReactComponents

export const PlaceReportWithQuantities = ({ from }) => {
  const { placeReportId, projectId, placeId2 } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [isDesigning] = useAtom(designingAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT * FROM place_reports WHERE place_report_id = $1`,
    [placeReportId],
  )
  const row: PlaceReports | undefined = res?.rows?.[0]

  const quantitiesRes = useLiveQuery(
    `SELECT place_report_quantity_id FROM place_report_quantities WHERE place_report_id = $1 ORDER BY place_report_quantity_id`,
    [placeReportId],
  )
  const quantities = quantitiesRes?.rows ?? []

  const placeLevelRes = useLiveQuery(
    `SELECT place_report_quantities FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = placeLevelRes?.rows?.[0]
  const showQuantities =
    isDesigning || placeLevel?.place_report_quantities !== false

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return
    try {
      await db.query(
        `UPDATE place_reports SET ${name} = $1 WHERE place_report_id = $2`,
        [value, placeReportId],
      )
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
      table: 'place_reports',
      rowIdName: 'place_report_id',
      rowId: placeReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const addQuantity = async () => {
    await createPlaceReportQuantity({ placeReportId })
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
                  <div key={q.place_report_quantity_id}>
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
                    <PlaceReportQuantityInline
                      placeReportQuantityId={q.place_report_quantity_id}
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
            table={formatMessage({ id: 'bCFgHi', defaultMessage: 'Bericht' })}
            id={placeReportId}
          />
        )}
      </div>
    </div>
  )
}
