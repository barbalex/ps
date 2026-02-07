import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { ProjectNode } from './Project/index.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useProjectsNavData } from '../../modules/useProjectsNavData.ts'
import { DesigningButton } from './Projects/DesigningButton.tsx'

export const ProjectsNode = () => {
  const navigate = useNavigate()

  const { navData } = useProjectsNavData({})
  const {
    label,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    level,
    isOpen,
    isInActiveNodeArray,
    isActive,
    navs,
  } = navData

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({
        node: ownArray,
        isRoot: true,
      })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }

      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }

  // only list navs if isOpen AND the first nav has an id
  const showNavs = isOpen && navs.length > 0 && navs[0].id

  return (
    <>
      <Node
        label={label}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={navs.length}
        to={ownUrl}
        toParams={undefined}
        onClickButton={onClickButton}
        sibling={<DesigningButton />}
      />
      {showNavs &&
        navs.map((nav, i) => (
          <ProjectNode
            key={`${nav.id}-${i}`}
            nav={nav}
          />
        ))}
    </>
  )
}
