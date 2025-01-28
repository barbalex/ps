import { useCallback, memo } from 'react'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'
import { Button } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { pipe } from 'remeda'

import { useElectric } from '../../../ElectricProvider.tsx'
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

  const onClick = useCallback(
    (e) => {
      e.stopPropagation()
      setDesigning(!designing)
    },
    [designing, setDesigning],
  )

  const { results: project } = useLiveQuery(
    db.projects.liveUnique({
      where: { project_id },
      include: { accounts: true, project_users: true },
    }),
  )
  const userIsOwner = project?.account_id === project?.accounts?.account_id
  const projectUser = project?.project_users?.find(
    (pu) => pu.user_id === userId,
  )
  const userRole = projectUser?.role
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
