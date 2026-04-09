import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { MdCheckCircle as ActiveIcon } from 'react-icons/md'

import { Node } from './Node.tsx'
import styles from './SubprojectReportDesign.module.css'

export const SubprojectReportDesignNode = ({
  projectId,
  nav,
  level = 4,
}: {
  projectId: string
  nav: { id: string; label: string; active: boolean }
  level?: number
}) => {
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = ['data', 'projects', projectId, 'subproject-designs', nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const label = nav.active ? (
    <span className={styles.label}>
      <ActiveIcon className={styles.activeIcon} />
      {nav.label}
    </span>
  ) : (
    nav.label
  )

  return (
    <Node
      label={label}
      id={nav.id}
      level={level}
      isInActiveNodeArray={isInActiveNodeArray}
      isActive={isActive}
      childrenCount={0}
      to={ownUrl}
    />
  )
}
