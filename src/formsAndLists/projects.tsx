import { useNavigate } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { createProject } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useProjectsNavData } from '../modules/useProjectsNavData.ts'
import { userIdAtom, addNotificationAtom } from '../store.ts'

import '../form.css'

export const Projects = () => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const userId = useAtomValue(userIdAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const db = usePGlite()

  const { loading, navData, isFiltered } = useProjectsNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const accountRes = await db.query(
      `SELECT account_id FROM accounts WHERE user_id = $1 LIMIT 1`,
      [userId],
    )
    if (!accountRes?.rows?.[0]?.account_id) {
      addNotification({
        title: formatMessage({
          id: 'noAccountTitle',
          defaultMessage: 'Kein Konto vorhanden',
        }),
        body: formatMessage({
          id: 'noAccountBody',
          defaultMessage:
            'Um Projekte zu erstellen, bitte zuerst ein Konto anlegen.',
        }),
        intent: 'warning',
      })
      navigate({ to: `/data/users/${userId}/accounts/` })
      return
    }
    const project_id = await createProject()
    if (!project_id) return
    navigate({
      to: `/data/projects/$project_id/project`,
      params: { project_id },
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map((nav) => (
            <Row
              key={nav.id}
              label={nav.label}
              to={nav.id}
            />
          ))
        }
      </div>
    </div>
  )
}
