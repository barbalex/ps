import { useRef, useCallback, memo } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { Tab, TabList } from '@fluentui/react-components'
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Header } from './Header.tsx'
import { Component as Form } from './Form.tsx'
import { Design } from './Design.tsx'
import { useElectric } from '../../ElectricProvider.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'

import '../../form.css'

export const Component = memo(() => {
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const { project_id } = useParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!

  const { results: row } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const designing = appState?.designing ?? false

  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('projectTab') ?? 'form'
  const onTabSelect = useCallback(
    (event: SelectTabEvent, data: SelectTabData) =>
      setSearchParams({ projectTab: data.value }),
    [setSearchParams],
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.projects.update({
        where: { project_id },
        data: { [name]: value },
      })
    },
    [db.projects, project_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <TabList selectedValue={tab} onTabSelect={onTabSelect}>
        <Tab id="form" value="form">
          Form
        </Tab>
        {designing && (
          <Tab id="design" value="design">
            Design
          </Tab>
        )}
        <Tab id="charts" value="charts">
          Charts
        </Tab>
      </TabList>
      {tab === 'form' && (
        <div className="form-container" role="tabpanel" aria-labelledby="form">
          <TextFieldInactive
            label="ID"
            name="project_id"
            value={row.project_id}
          />
          <Form row={row} onChange={onChange} autoFocusRef={autoFocusRef} />
        </div>
      )}
      {tab === 'design' && designing && (
        <Design onChange={onChange} row={row} />
      )}
      {tab === 'charts' && (
        <div
          role="tabpanel"
          aria-labelledby="charts"
          className="form-container"
        >
          <div>charts</div>
        </div>
      )}
    </div>
  )
})
