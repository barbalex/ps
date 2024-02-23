import { useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tab, TabList } from '@fluentui/react-components'
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { Header } from './Header'
import { Form } from './Form'
import { Design } from './Design'
import { useElectric } from '../../ElectricProvider'
import { user_id } from '../../components/SqlInitializer'

import '../../form.css'

export const Component = () => {
  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!

  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const designing = uiOption?.designing ?? false

  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('projectTab') ?? 'form'
  const onTabSelect = useCallback(
    (event: SelectTabEvent, data: SelectTabData) =>
      setSearchParams({ projectTab: data.value }),
    [setSearchParams],
  )

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
        <Tab id="analysis" value="analysis">
          Analysis
        </Tab>
      </TabList>
      {tab === 'form' && (
        <div role="tabpanel" aria-labelledby="form">
          <Form autoFocusRef={autoFocusRef} />
        </div>
      )}
      {tab === 'design' && designing && <Design />}
      {tab === 'analysis' && (
        <div
          role="tabpanel"
          aria-labelledby="analysis"
          className="form-container"
        >
          <div>analysis</div>
        </div>
      )}
    </div>
  )
}
