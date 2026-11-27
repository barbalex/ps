import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Tab, TabList } = fluentUiReactComponents
import type { SelectTabEvent, SelectTabData } from '@fluentui/react-components'
import { useSearch, useNavigate } from '@tanstack/react-router'

import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'
import { Layers } from './Layers/index.tsx'
import { Legends } from './Legends/index.tsx'
import { MapScope } from './MapScope.tsx'
import styles from './Content.module.css'

export const Content = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate() as unknown as (options: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>
  }) => void | Promise<void>
  // TODO: test
  // leftMapDrawerTab is an unvalidated search param (not in any route search schema)
  const { leftMapDrawerTab: tab = 'layers' } = useSearch({
    strict: false,
  }) as { leftMapDrawerTab?: string }
  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) =>
    navigate({ search: (prev) => ({ ...prev, leftMapDrawerTab: data.value }) })

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <TabList
          selectedValue={tab}
          onTabSelect={onTabSelect}
          className={styles.tabList}
        >
          <Tab value="layers">{formatMessage({ id: 'SmuSBE', defaultMessage: 'Ebenen' })}</Tab>
          <Tab value="legends">{formatMessage({ id: 'mapLegendsTab', defaultMessage: 'Legenden' })}</Tab>
        </TabList>
        <div className={styles.form}>
          {tab === 'layers' ?
            <>
              <MapScope />
              <Layers />
            </>
          : <Legends />}
        </div>
      </div>
    </ErrorBoundary>
  )
}
