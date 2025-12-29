import {
  Tab,
  TabList,
  SelectTabEvent,
  SelectTabData,
} from '@fluentui/react-components'
import { useSearch, useNavigate } from '@tanstack/react-router'

import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'
import { Layers } from './Layers/index.tsx'
import { Legends } from './Legends/index.tsx'
import styles from './Content.module.css'

export const Content = () => {
  const navigate = useNavigate()
  // TODO: test
  const { leftMapDrawerTab: tab = 'layers' } = useSearch({ strict: false })
  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) =>
    navigate({ search: { leftMapDrawerTab: data.value } })

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <TabList
          selectedValue={tab}
          onTabSelect={onTabSelect}
          className={styles.tabList}
        >
          <Tab value="layers">Layers</Tab>
          <Tab value="legends">Legends</Tab>
        </TabList>
        <div className={styles.form}>
          {tab === 'layers' ? <Layers /> : <Legends />}
        </div>
      </div>
    </ErrorBoundary>
  )
}
