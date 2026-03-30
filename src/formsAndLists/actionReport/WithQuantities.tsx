import { useRef, useState } from 'react'
import {
  useParams,
  useNavigate,
  useLocation,
  Outlet,
} from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { createActionReportQuantity } from '../../modules/createRows.ts'
import { Header } from './Header.tsx'
import { ActionReportForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { addOperationAtom, designingAtom } from '../../store.ts'
import type ActionReports from '../../models/public/ActionReports.ts'

import '../../form.css'

const { Button } = fluentUiReactComponents

export const ActionReportWithQuantities = ({ from }) => {
  const { actionReportId, projectId, placeId, placeId2, subprojectId } =
    useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [isDesigning] = useAtom(designingAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT * FROM action_reports WHERE place_action_report_id = $1`,
    [actionReportId],
  )
  const row: ActionReports | undefined = res?.rows?.[0]

  const quantitiesCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM action_report_quantities WHERE place_action_report_id = $1`,
    [actionReportId],
  )
  const quantitiesCount = quantitiesCountRes?.rows?.[0]?.count ?? 0

  const placeLevelRes = useLiveQuery(
    `SELECT action_report_quantities FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = placeLevelRes?.rows?.[0]
  const showQuantities =
    isDesigning || placeLevel?.action_report_quantities !== false

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return
    try {
      await db.query(
        `UPDATE action_reports SET ${name} = $1 WHERE place_action_report_id = $2`,
        [value, actionReportId],
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
      table: 'action_reports',
      rowIdName: 'place_action_report_id',
      rowId: actionReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const isQuantitiesOpen =
    location.pathname.endsWith('/quantities') ||
    location.pathname.includes('/quantities/')
  const isQuantitiesList = /\/quantities\/?$/.test(location.pathname)

  const actionReportBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${placeId2 ? `/places/${placeId2}` : ''}/action-reports/${actionReportId}`
  const quantitiesUrl = `${actionReportBaseUrl}/quantities`

  const addQuantity = async () => {
    const id = await createActionReportQuantity({ actionReportId })
    if (!id) return
    navigate({ to: `${quantitiesUrl}/${id}` })
  }

  const quantitiesHeaderActions =
    showQuantities && isQuantitiesList ? (
      <Button
        size="medium"
        title={formatMessage({
          id: 'V6iUlF',
          defaultMessage: 'Menge hinzufügen',
        })}
        icon={<FaPlus />}
        onClick={addQuantity}
      />
    ) : undefined

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
            {showQuantities ? (
              <Section
                title={`${formatMessage({ id: 'Xuj/Gy', defaultMessage: 'Mengen' })} (${quantitiesCount})`}
                onHeaderClick={() =>
                  isQuantitiesList
                    ? navigate({ to: actionReportBaseUrl })
                    : navigate({ to: quantitiesUrl })
                }
                isOpen={isQuantitiesOpen}
                titleStyle={{ marginBottom: 0 }}
                childrenStyle={{ marginLeft: -10, marginRight: -10 }}
                headerActions={quantitiesHeaderActions}
              >
                {isQuantitiesOpen && <Outlet />}
              </Section>
            ) : (
              isQuantitiesOpen && <Outlet />
            )}
          </>
        ) : (
          <NotFound
            table={formatMessage({
              id: 'YMGqLf',
              defaultMessage: 'Massnahmen-Bericht',
            })}
            id={actionReportId}
          />
        )}
      </div>
    </div>
  )
}
