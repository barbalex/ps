import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { FaCopy } from 'react-icons/fa'
import { Button, Tooltip } from '@fluentui/react-components'
import { uuidv7 } from '@kripod/uuidv7'

import { createSubprojectHistory } from '../modules/createRows.ts'
import { useSubprojectHistoriesNavData } from '../modules/useSubprojectHistoriesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { addOperationAtom } from '../store.ts'
import '../form.css'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/histories/'

export const SubprojectHistories = () => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const { loading, navData } = useSubprojectHistoriesNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createSubprojectHistory({ subprojectId })
    if (!id) return
    navigate({ to: id })
  }

  const copyFromSubproject = async () => {
    try {
      // Get the parent subproject data
      const subprojectRes = await db.query(
        `SELECT * FROM subprojects WHERE subproject_id = $1`,
        [subprojectId],
      )
      const subproject = subprojectRes?.rows?.[0]
      if (!subproject) return

      // Create a new history with data from subproject
      const subproject_history_id = uuidv7()
      const data = {
        subproject_history_id,
        subproject_id: subproject.subproject_id,
        year: null,
        account_id: subproject.account_id,
        project_id: subproject.project_id,
        name: subproject.name,
        start_year: subproject.start_year,
        end_year: subproject.end_year,
        data: subproject.data,
      }

      const columns = Object.keys(data).join(',')
      const values = Object.values(data)
        .map((_, i) => `$${i + 1}`)
        .join(',')

      await db.query(
        `insert into subproject_histories (${columns}) values (${values})`,
        Object.values(data),
      )

      addOperation({
        table: 'subproject_histories',
        operation: 'insert',
        rowIdName: 'subproject_history_id',
        rowId: subproject_history_id,
        draft: data,
      })

      // Navigate to the new history
      navigate({ to: subproject_history_id })
    } catch (error) {
      console.error('Error copying subproject to history:', error)
    }
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={[
          <Tooltip
            key="copy-from-subproject"
            content="Copy data from subproject to new history"
          >
            <Button
              size="medium"
              icon={<FaCopy />}
              onClick={copyFromSubproject}
            />
          </Tooltip>,
        ]}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              to={id}
              label={label ?? id}
            />
          ))
        }
      </div>
    </div>
  )
}
