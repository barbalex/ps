import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { CheckTaxonNode } from './CheckTaxon.tsx'
import { Places as Place } from '../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  check_id: string
  level?: number
}

export const CheckTaxaNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    check_id,
    level = 9,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: checkTaxa = [] } = useLiveQuery(
      db.check_taxa.liveMany({
        where: { check_id },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const checkTaxaNode = useMemo(
      () => ({ label: `Taxa (${checkTaxa.length})` }),
      [checkTaxa.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpenBase =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'places' &&
      urlPath[6] === (place_id ?? place.place_id)
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[7] === 'places' &&
        urlPath[8] === place.place_id &&
        urlPath[9] === 'checks' &&
        urlPath[10] === check_id &&
        urlPath[11] === 'taxa'
      : isOpenBase &&
        urlPath[7] === 'checks' &&
        urlPath[8] === check_id &&
        urlPath[9] === 'taxa'
    const isActive = isOpen && urlPath.length === level

    const baseArray = useMemo(
      () => [
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
        'checks',
        check_id,
      ],
      [check_id, place.place_id, place_id, project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, 'taxa'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({ pathname: `${baseUrl}/taxa`, search: searchParams.toString() })
    }, [
      appState?.app_state_id,
      baseArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      searchParams,
    ])

    return (
      <>
        <Node
          node={checkTaxaNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={checkTaxa.length}
          to={`${baseUrl}/taxa`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          checkTaxa.map((checkTaxon) => (
            <CheckTaxonNode
              key={checkTaxon.check_taxon_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check_id={check_id}
              checkTaxon={checkTaxon}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
