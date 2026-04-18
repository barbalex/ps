import { useRef, useState } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { DateField } from '../../components/shared/DateField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { FilterButton } from '../../components/shared/FilterButton.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { Fields } from '../fields.tsx'
import { createField } from '../../modules/createRows.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import { addOperationAtom, fieldsFilterAtom } from '../../store.ts'
import { accountTypeOptions } from '../../modules/constants.ts'
import styles from './index.module.css'
import '../../form.css'
import type Accounts from '../../models/public/Accounts.ts'
import type Users from '../../models/public/Users.ts'

const from = '/data/users/$userId_/accounts/$accountId_'
const { Button } = fluentUiReactComponents

export const Account = () => {
  const { userId, accountId } = useParams({ from })
  const location = useLocation()
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const [fieldsFilter] = useAtom(fieldsFilterAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const { formatMessage } = useIntl()

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
    [accountId, userId],
  )
  const row: Accounts | undefined = res?.rows?.[0]

  const userRes = useLiveQuery(
    `SELECT project_fields_in_account FROM users WHERE user_id = $1`,
    [userId],
  )
  const userRow: Pick<Users, 'project_fields_in_account'> | undefined =
    userRes?.rows?.[0]

  const fieldsCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM fields WHERE account_id = $1 AND project_id IS NULL`,
    [accountId],
  )
  const fieldsCount = fieldsCountRes?.rows?.[0]?.count ?? 0

  const accountUrl = `/data/users/${userId}/accounts/${accountId}`
  const fieldsUrl = `${accountUrl}/project-fields`
  const projectFieldsInAccount = userRow?.project_fields_in_account !== false
  const isFieldsOpen =
    location.pathname.endsWith('/project-fields') ||
    location.pathname.includes('/project-fields/')
  const isFieldsList = /\/project-fields\/?$/.test(location.pathname)
  const fieldsIsFiltered = !!filterStringFromFilter(fieldsFilter)

  const onClickAddField = async () => {
    const id = await createField({ accountId, table_name: 'projects' })
    if (!id) return
    navigate({ to: `${fieldsUrl}/${id}` })
  }

  const fieldsHeaderActions =
    projectFieldsInAccount && isFieldsList ? (
      <>
        <FilterButton isFiltered={fieldsIsFiltered} />
        <Button
          size="medium"
          title={formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })}
          icon={<FaPlus />}
          onClick={onClickAddField}
        />
      </>
    ) : undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    // Validate period dates
    if (name === 'period_start' || name === 'period_end') {
      const startDate = name === 'period_start' ? value : row.period_start
      const endDate = name === 'period_end' ? value : row.period_end

      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        setValidations((prev) => ({
          ...prev,
          [name]: {
            state: 'error',
            message: formatMessage({
              id: 'p61gsZ',
              defaultMessage: 'Enddatum muss nach dem Startdatum liegen',
            }),
          },
        }))
        return
      } else {
        // remove all date related validations if any
        setValidations((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { period_start, period_end, ...rest } = prev
          return rest
        })
      }
    }

    try {
      await db.query(`UPDATE accounts SET ${name} = $1 WHERE account_id = $2`, [
        value,
        accountId,
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
      table: 'accounts',
      rowIdName: 'account_id',
      rowId: accountId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Account" id={accountId} />
  }

  // If project fields are configured to be shown outside the account form,
  // render the nested route as its own page.
  if (isFieldsOpen && !projectFieldsInAccount) {
    return <Outlet />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <RadioGroupField
          label={formatMessage({ id: 'xTeBn/', defaultMessage: 'Typ' })}
          name="type"
          list={accountTypeOptions.map((o) => o.value)}
          labelMap={Object.fromEntries(
            accountTypeOptions.map((o) => [
              o.value,
              formatMessage({
                id: o.labelId,
                defaultMessage: o.defaultMessage,
              }),
            ]),
          )}
          value={row.type ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.type?.state}
          validationMessage={validations?.type?.message}
        />
        <DateField
          label={formatMessage({ id: '88zF4u', defaultMessage: 'Beginnt' })}
          name="period_start"
          value={row.period_start}
          onChange={onChange}
          validationState={validations?.period_start?.state}
          validationMessage={validations?.period_start?.message}
        />
        <DateField
          label={formatMessage({ id: '20y992', defaultMessage: 'Endet' })}
          name="period_end"
          value={row.period_end}
          onChange={onChange}
          validationState={validations?.period_end?.state}
          validationMessage={validations?.period_end?.message}
        />
        {projectFieldsInAccount ? (
          <Section
            title={`${formatMessage({ id: 'field.projectFieldsPlural', defaultMessage: 'Project Fields' })} (${fieldsCount})`}
            parentUrl={accountUrl}
            listUrl={fieldsUrl}
            isOpen={isFieldsOpen}
            titleClassName={styles.sectionTitle}
            childrenClassName={styles.sectionChildren}
            headerActions={fieldsHeaderActions}
          >
            {isFieldsOpen &&
              (isFieldsList ? <Fields from={from} hideHeader /> : <Outlet />)}
          </Section>
        ) : (
          isFieldsOpen && <Outlet />
        )}
      </div>
    </div>
  )
}
