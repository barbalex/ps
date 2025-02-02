import { useCallback, memo } from 'react'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { Button } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { pipe } from 'remeda'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useCorbado } from '@corbado/react'

import { on } from '../../../css.ts'
import { designingAtom, userIdAtom } from '../../../store.ts'

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
  const [designing, setDesigning] = useAtom(designingAtom)
  const [userId] = useAtom(userIdAtom)
  const { project_id } = useParams()
  const db = usePGlite()
  const { user } = useCorbado()

  const onClick = useCallback(
    (e) => {
      e.stopPropagation()
      setDesigning(!designing)
    },
    [designing, setDesigning],
  )


  const resultProject = useLiveQuery(
    `
      SELECT
        pu.role as project_user_role,
        u.email as account_user_email
      FROM projects p 
        inner join accounts a on p.account_id = a.account_id 
          inner join users u on u.user_id = a.user_id
        inner join project_users pu on pu.project_id = p.project_id AND pu.user_id = $2
      WHERE 
        p.project_id = $1
    `,
    [project_id, userId],
  )
  const project = resultProject?.rows?.[0]
  const userIsOwner = project?.account_user_email === user?.email
  const userRole = project?.project_user_role
  // console.log('hello Project Editing', { projectUser, userRole, project })

  const userMayDesign = userIsOwner || userRole === 'manager'

  if (!userMayDesign) return null

  return (
    <Button
      size="small"
      icon={
        designing ? <MdEdit style={svgStyle} /> : <MdEditOff style={svgStyle} />
      }
      onClick={onClick}
      style={pipe(
        buttonStyle,
        on('&:hover', { filter: 'brightness(0.9)', backgroundColor: 'white' }),
      )}
      title={
        designing ? 'Designing this project. Click to stop' : 'Start designing'
      }
      className="designing-button"
    />
  )
})
