import { useRef, useCallback, memo } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { Tab, TabList } from '@fluentui/react-components'
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Header } from './Header.tsx'
import { Component as Form } from './Form.tsx'
import { Design } from './Design/index.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { designingAtom } from '../../store.ts'

import '../../form.css'

export const Component = memo(() => {
  const [designing] = useAtom(designingAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const { project_id } = useParams()

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT * FROM projects WHERE project_id = $1`,
    [project_id],
    'project_id',
  )
  const row = res?.rows?.[0]

  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('projectTab') ?? 'form'
  const onTabSelect = useCallback(
    (event: SelectTabEvent, data: SelectTabData) =>
      setSearchParams({ projectTab: data.value }),
    [setSearchParams],
  )

  const onChange = useCallback<InputProps['onChange']>(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      try {
        await db.query(
          `UPDATE projects SET ${name} = $1 WHERE project_id = $2`,
          [value, project_id],
        )
      } catch (error) {
        console.error('error updating project', error)
      }
    },
    [db, project_id, row],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <TabList
        selectedValue={tab}
        onTabSelect={onTabSelect}
      >
        <Tab
          id="form"
          value="form"
        >
          Form
        </Tab>
        {designing && (
          <Tab
            id="design"
            value="design"
          >
            Design
          </Tab>
        )}
      </TabList>
      {tab === 'form' && (
        <div
          role="tabpanel"
          aria-labelledby="form"
        >
          <Form
            row={row}
            onChange={onChange}
            autoFocusRef={autoFocusRef}
          />
        </div>
      )}
      {tab === 'design' && designing && (
        <Design
          onChange={onChange}
          row={row}
        />
      )}
    </div>
  )
})
