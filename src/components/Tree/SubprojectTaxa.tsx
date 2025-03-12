import { useCallback, useMemo, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { SubprojectTaxonNode } from './SubprojectTaxon.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const SubprojectTaxaNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const res = useLiveIncrementalQuery(
      `
      SELECT
        subproject_taxon_id,
        label 
      FROM subproject_taxa 
      WHERE subproject_id = $1 
      ORDER BY label`,
      [subproject_id],
      'subproject_taxon_id',
    )
    const rows = res?.rows ?? []
    const loading = res === undefined

    const node = useMemo(
      () => ({
        label: `Taxa (${loading ? '...' : formatNumber(rows.length)})`,
      }),
      [loading, rows.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => ['data', 'projects', project_id, 'subprojects', subproject_id],
      [project_id, subproject_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'taxa'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({ node: ownArray })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({
            pathname: parentUrl,
            search: searchParams.toString(),
          })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({ nodes: [ownArray] })
    }, [
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={node}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={rows.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          rows.map((subprojectTaxon) => (
            <SubprojectTaxonNode
              key={subprojectTaxon.subproject_taxon_id}
              project_id={project_id}
              subproject_id={subproject_id}
              subprojectTaxon={subprojectTaxon}
            />
          ))}
      </>
    )
  },
)
