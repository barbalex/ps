import { useRef, useCallback, memo } from 'react'
import { Tab, TabList } from '@fluentui/react-components'
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'

import { Header } from './Header.tsx'
import { ProjectForm as Form } from './Form.tsx'
import { Design } from './Design/index.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { designingAtom } from '../../store.ts'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

export const Project = memo(({ from }) => {
  const [designing] = useAtom(designingAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const { projectId } = useParams({ from })
  const { projectTab } = useSearch({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const row = res?.rows?.[0]

  console.log('Project', { res, projectId })

  const onTabSelect = useCallback(
    (event: SelectTabEvent, data: SelectTabData) => {
      navigate({ search: { projectTab: data.value } })
    },
    [navigate],
  )

  const onChange = useCallback<InputProps['onChange']>(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      try {
        await db.query(
          `UPDATE projects SET ${name} = $1 WHERE project_id = $2`,
          [value, projectId],
        )
      } catch (error) {
        console.error('error updating project', error)
      }
    },
    [db, projectId, row],
  )

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Project"
        id={projectId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <TabList
        selectedValue={projectTab}
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
      {projectTab === 'form' && (
        <div
          role="tabpanel"
          aria-labelledby="form"
        >
          <Form
            row={row}
            onChange={onChange}
            autoFocusRef={autoFocusRef}
            from={from}
          />
        </div>
      )}
      {projectTab === 'design' && designing && (
        <Design
          onChange={onChange}
          row={row}
          from={from}
        />
      )}
    </div>
  )
})
