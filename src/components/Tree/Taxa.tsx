import { useNavigate } from '@tanstack/react-router'

import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { Node } from './Node.tsx'
import { TaxonNode } from './Taxon.tsx'
import { useTaxaNavData } from '../../modules/useTaxaNavData.ts'

interface Props {
  projectId: string
  taxonomy_id: string
  level?: number
}

export const TaxaNode = ({ projectId, taxonomyId, level = 5 }: Props) => {
  const navigate = useNavigate()

  const { navData } = useTaxaNavData({ projectId, taxonomyId })
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
          <TaxonNode
            key={`${nav.id}-${i}`}
            projectId={projectId}
            taxonomyId={taxonomyId}
            nav={nav}
          />
        ))}
    </>
  )
}
