import { useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { ToggleButton } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../../ElectricProvider'

export const DesigningButton = memo(() => {
  const { project_id } = useParams()

  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { authenticated_email: authUser.email } }),
  )
  const designing = appState?.designing ?? false
  const onClickDesigning = useCallback(() => {
    db.app_states.update({
      where: { app_state_id: appState?.app_state_id },
      data: { designing: !designing },
    })
  }, [appState?.app_state_id, db.app_states, designing])

  const { results: project } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const { results: account } = useLiveQuery(
    db.accounts.liveFirst({ where: { user_id: appState?.user_id } }),
  )
  const userIsOwner = project?.account_id === account?.account_id
  const { results: projectUser } = useLiveQuery(
    db.project_users.liveFirst({
      where: { project_id, user_id: appState?.user_id },
    }),
  )
  const userRole = projectUser?.role

  const userMayDesign = userIsOwner || userRole === 'manager'

  if (!userMayDesign) return null

  return (
    <ToggleButton
      checked={designing}
      title={
        designing ? 'Designing this project. Click to stop' : 'Start designing'
      }
      icon={designing ? <MdEdit /> : <MdEditOff />}
      onClick={onClickDesigning}
    />
  )
})
