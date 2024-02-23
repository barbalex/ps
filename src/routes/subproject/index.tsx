import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import {
  makeStyles,
  shorthands,
  tokens,
  Tab,
  TabList,
} from '@fluentui/react-components'
import type {
  SelectTabData,
  SelectTabEvent,
  TabValue,
} from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'
import { SubprojectForm } from './Form'

import '../../form.css'

export const Component = () => {
  const { subproject_id } = useParams()

  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'form'
  const onTabSelect = useCallback(
    (event: SelectTabEvent, data: SelectTabData) =>
      setSearchParams({ tab: data.value }),
    [],
  )

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.subprojects.liveUnique({ where: { subproject_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subprojects.update({
        where: { subproject_id },
        data: { [name]: value },
      })
    },
    [db.subprojects, subproject_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('subproject, row.data:', row?.data)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <TabList selectedValue={tab} onTabSelect={onTabSelect}>
        <Tab id="form" value="form">
          Form
        </Tab>
        <Tab id="files" value="files">
          Files
        </Tab>
        <Tab id="analysis" value="analysis">
          Analysis
        </Tab>
      </TabList>
      {tab === 'form' && (
        <div role="tabpanel" aria-labelledby="form">
          <SubprojectForm autoFocusRef={autoFocusRef} />
        </div>
      )}
      {tab === 'files' && (
        <div role="tabpanel" aria-labelledby="files" className="form-container">
          <div>files</div>
        </div>
      )}
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
