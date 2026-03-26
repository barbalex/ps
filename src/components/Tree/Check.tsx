import { useLocation, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { CheckQuantitiesNode } from './CheckQuantities.tsx'
import { CheckTaxaNode } from './CheckTaxa.tsx'
import { FilesNode } from './Files.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useIntl } from 'react-intl'

import { treeOpenNodesAtom, designingAtom } from '../../store.ts'

export const CheckNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  nav,
  level = 8,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [isDesigning] = useAtom(designingAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  // need project to know whether to show files
  const res = useLiveQuery(
    `SELECT check_files, files_in_check, check_quantities, check_quantities_in_check, check_taxa, check_taxa_in_check
     FROM place_levels
     WHERE project_id = $1 AND (level IS NULL OR level = $2)`,
    [projectId, placeId2 ? 2 : 1],
  )
  const row = res?.rows?.[0]
  const showFiles = isDesigning || row?.check_files !== false
  const filesInCheck =
    (isDesigning || row?.check_files !== false) && row?.files_in_check !== false
  const placeLevel = row
  const quantitiesInCheck = placeLevel?.check_quantities_in_check !== false
  const taxaInCheck = placeLevel?.check_taxa_in_check !== false

  const showQuantitiesNav =
    !quantitiesInCheck && (isDesigning || placeLevel?.check_quantities !== false)
  const showTaxaNav =
    !taxaInCheck && (isDesigning || placeLevel?.check_taxa !== false)
  const showFilesNav = !filesInCheck && showFiles
  const allInline = !showQuantitiesNav && !showTaxaNav && !showFilesNav

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'checks',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({
          to: parentUrl,
        })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }

  return (
    <>
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={allInline ? 0 : 1}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          {(() => {
            return (
              <>
                {!allInline && (
                  <Node
                    label={formatMessage({
                      id: 'ZCwpER',
                      defaultMessage: 'Kontrolle',
                    })}
                    level={level + 1}
                    isInActiveNodeArray={
                      ownArray.every((part, i) => urlPath[i] === part) &&
                      urlPath[ownArray.length] === 'check'
                    }
                    isActive={isEqual([...ownArray, 'check'], urlPath)}
                    childrenCount={0}
                    to={`${ownUrl}/check`}
                  />
                )}
                {showQuantitiesNav && (
                  <CheckQuantitiesNode
                    projectId={projectId}
                    subprojectId={subprojectId}
                    placeId={placeId}
                    placeId2={placeId2}
                    checkId={nav.id}
                    level={level + 1}
                  />
                )}
                {showTaxaNav && (
                  <CheckTaxaNode
                    projectId={projectId}
                    subprojectId={subprojectId}
                    placeId={placeId}
                    placeId2={placeId2}
                    checkId={nav.id}
                    level={level + 1}
                  />
                )}
                {showFilesNav && (
                  <FilesNode
                    projectId={projectId}
                    subprojectId={subprojectId}
                    placeId={placeId}
                    placeId2={placeId2}
                    checkId={nav.id}
                    level={level + 1}
                  />
                )}
              </>
            )
          })()}
        </>
      )}
    </>
  )
}
