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
import { createCheckReportQuantity } from '../../modules/createRows.ts'
import { Header } from './Header.tsx'
import { CheckReportForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { addOperationAtom, designingAtom } from '../../store.ts'
import type CheckReports from '../../models/public/CheckReports.ts'

import '../../form.css'

const { Button } = fluentUiReactComponents

export const CheckReportWithQuantities = ({ from }) => {
  const { checkReportId, projectId, placeId, placeId2, subprojectId } =
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
    `SELECT * FROM check_reports WHERE place_check_report_id = $1`,
    [checkReportId],
  )
  const row: CheckReports | undefined = res?.rows?.[0]

  const quantitiesCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM check_report_quantities WHERE place_check_report_id = $1`,
    [checkReportId],
  )
  const quantitiesCount = quantitiesCountRes?.rows?.[0]?.count ?? 0

  const placeLevelRes = useLiveQuery(
    `SELECT check_report_quantities FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = placeLevelRes?.rows?.[0]
  const showQuantities =
    isDesigning || placeLevel?.check_report_quantities !== false

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return
    try {
      await db.query(
        `UPDATE check_reports SET ${name} = $1 WHERE place_check_report_id = $2`,
        [value, checkReportId],
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
      table: 'check_reports',
      rowIdName: 'place_check_report_id',
      rowId: checkReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const isQuantitiesOpen =
    location.pathname.endsWith('/quantities') ||
    location.pathname.includes('/quantities/')
  const isQuantitiesList = /\/quantities\/?$/.test(location.pathname)

  const checkReportBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${placeId2 ? `/places/${placeId2}` : ''}/check-reports/${checkReportId}`
  const quantitiesUrl = `${checkReportBaseUrl}/quantities`

  const addQuantity = async () => {
    const id = await createCheckReportQuantity({ checkReportId })
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
                    ? navigate({ to: checkReportBaseUrl })
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
            table={formatMessage({ id: 'bCFgHi', defaultMessage: 'Bericht' })}
            id={checkReportId}
          />
        )}
      </div>
    </div>
  )
}
