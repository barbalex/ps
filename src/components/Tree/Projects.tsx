import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { ProjectNode } from './Project/index.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useProjectsNavData } from '../../modules/useProjectsNavData.ts'

export const ProjectsNode = memo(() => {
  const navigate = useNavigate()

  const { navData } = useProjectsNavData()

  const onClickButton = useCallback(() => {
    if (navData.isOpen) {
      removeChildNodes({
        node: navData.ownArray,
        isRoot: true,
      })
      // only navigate if urlPath includes ownArray
      if (
        navData.isInActiveNodeArray &&
        navData.ownArray.length <= navData.urlPath.length
      ) {
        navigate({ to: '/data' })
      }

      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [navData.ownArray] })
  }, [
    navData.isInActiveNodeArray,
    navData.isOpen,
    navData.ownArray,
    navData.urlPath.length,
    navigate,
  ])

  return (
    <>
      <Node
        node={{ label: navData.label }}
        level={navData.level}
        isOpen={navData.isOpen}
        isInActiveNodeArray={navData.isInActiveNodeArray}
        isActive={navData.isActive}
        childrenCount={navData.navs.length}
        to={navData.ownUrl}
        toParams={undefined}
        onClickButton={onClickButton}
      />
      {navData.isOpen &&
        navData.navs.map((project) => (
          <ProjectNode
            key={project.project_id}
            project={project}
          />
        ))}
    </>
  )
})
