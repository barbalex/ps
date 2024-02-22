import { useCallback } from 'react'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'
import { Button } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'
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

export const Editing = () => {
  const { project_id } = useParams()

  const { db } = useElectric()!
  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const designing = uiOption?.designing ?? false

  const onClick = useCallback(() => {
    db.ui_options.update({
      where: { user_id },
      data: { designing: !designing },
    })
  }, [db.ui_options, designing])

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
}
