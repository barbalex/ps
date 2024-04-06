import { useCallback, memo } from 'react'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'
import { Button } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../../../ElectricProvider'
import { css } from '../../../css'

const buttonStyle = {
  borderRadius: 20,
  border: 'none',
  color: 'rgb(51, 51, 51) !important',
  backgroundColor: 'transparent',
}

const svgStyle = {
  fontSize: 'medium',
}

export const Editing = memo(() => {
  const { project_id } = useParams()

  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveUnique({ where: { user_email: authUser?.email } }),
  )
  const designing = appState?.designing ?? false

  const onClick = useCallback(
    (e) => {
      e.stopPropagation()
      db.app_states.update({
        where: { user_email: authUser?.email },
        data: { designing: !designing },
      })
    },
    [authUser?.email, db.app_states, designing],
  )

  const { results: project } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const { results: account } = useLiveQuery(
    db.accounts.liveUnique({ where: { user_id: appState?.user_id } }),
  )
  const userIsOwner = project?.account_id === account?.account_id
  const { results: projectUser } = useLiveQuery(
    db.project_users.liveUnique({
      where: { project_id, user_id: appState?.user_id },
    }),
  )
  const userRole = projectUser?.role

  const userMayDesign = userIsOwner || userRole === 'manager'

  if (!userMayDesign) return null

  return (
    <Button
      size="small"
      icon={
        designing ? <MdEdit style={svgStyle} /> : <MdEditOff style={svgStyle} />
      }
      onClick={onClick}
      style={css({
        ...buttonStyle,
        on: ($) => [
          $('&:hover', { filter: 'brightness(0.8)', backgroundColor: 'white' }),
        ],
      })}
      title={
        designing ? 'Designing this project. Click to stop' : 'Start designing'
      }
    />
  )
})
