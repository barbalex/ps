import { useContext } from 'react'
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
import { IsNarrowContext } from './IsNarrowContext.ts'
import styles from './Content.module.css'

export const Content = () => {
  const navigate = useNavigate()
  const isNarrow = useContext(IsNarrowContext)
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
          style={{
            paddingLeft: isNarrow ? 34 : 'unset',
            backgroundColor: 'rgba(103, 216, 101, 0.2)',
          }}
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
