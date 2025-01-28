import { useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { ToggleButton } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useAtom } from 'jotai'

import { useElectric } from '../../ElectricProvider.tsx'
import { designingAtom, userIdAtom } from '../../store.ts'

export const DesigningButton = memo(() => {
  const [designing, setDesigning] = useAtom(designingAtom)
  const [userId] = useAtom(userIdAtom)
  const { project_id } = useParams()
  const db = usePGlite()

  const onClickDesigning = useCallback(
    () => setDesigning(!designing),
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
  // console.log('hello project DesignButton', { projectUser, userRole })

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
      className="designing-button"
    />
  )
})
