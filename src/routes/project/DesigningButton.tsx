import { useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { ToggleButton } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../../components/SqlInitializer'

export const DesigningButton = memo(() => {
  const { project_id } = useParams()

  const { db } = useElectric()!
  const { results: uiOption } = useLiveQuery(
    db.app_state.liveUnique({ where: { user_id } }),
  )
  const designing = uiOption?.designing ?? false
  const onClickDesigning = useCallback(() => {
    db.app_state.update({
      where: { user_id },
      data: { designing: !designing },
    })
  }, [db.app_state, designing])

  const { results: project } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const { results: account } = useLiveQuery(
    db.accounts.liveFirst({ where: { user_id } }),
  )
  const userIsOwner = project?.account_id === account?.account_id
  const { results: projectUser } = useLiveQuery(
    db.project_users.liveFirst({
      where: { project_id, user_id, deleted: false },
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
