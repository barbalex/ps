import { useNavigate } from '@tanstack/react-router'

import { Node } from './Node.tsx'
import { ProjectReportDesignNode } from './ProjectReportDesign.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useProjectReportDesignsNavData } from '../../modules/useProjectReportDesignsNavData.ts'

interface Props {
  projectId: string
  level: number
}

export const ProjectReportDesignsNode = ({ projectId, level }: Props) => {
  const navigate = useNavigate()

  const { navData } = useProjectReportDesignsNavData({
    projectId,
  })
  const {
    label,
    parentUrl,
    ownArray,
    ownUrl,
    urlPath,
    isOpen,
    isInActiveNodeArray,
    isActive,
    navs,
  } = navData

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
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
        onClickButton={onClickButton}
      />
      {showNavs &&
        navs.map((nav, i) => (
          <ProjectReportDesignNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            nav={nav}
            level={level + 1}
          />
        ))}
    </>
  )
}
