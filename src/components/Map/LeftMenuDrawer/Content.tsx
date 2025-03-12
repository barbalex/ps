import { memo, useCallback, useContext } from 'react'
import {
  Tab,
  TabList,
  SelectTabEvent,
  SelectTabData,
} from '@fluentui/react-components'
import { useSearchParams } from 'react-router'

import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'
import { Layers } from './Layers/index.tsx'
import { Legends } from './Legends/index.tsx'
import { IsNarrowContext } from './IsNarrowContext.ts'

const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
}

const formStyle = {
  // enable scrolling
  overflow: 'auto',
  height: '100%',
  width: '100%',
}

export const Content = memo(() => {
  const isNarrow = useContext(IsNarrowContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('leftMapDrawerTab') ?? 'layers'
  const onTabSelect = useCallback(
    (event: SelectTabEvent, data: SelectTabData) =>
      setSearchParams({ leftMapDrawerTab: data.value }),
    [setSearchParams],
  )

  return (
    <ErrorBoundary>
      <div style={containerStyle}>
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
        <div style={formStyle}>
          {tab === 'layers' ? <Layers /> : <Legends />}
        </div>
      </div>
    </ErrorBoundary>
  )
})
