import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { PlaceNode } from './Place/index.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import {
  treeOpenNodesAtom,
  places1FilterAtom,
  places2FilterAtom,
} from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
}

export const PlacesNode = memo(
  ({ project_id, subproject_id, place_id }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [places1Filter] = useAtom(places1FilterAtom)
    const [places2Filter] = useAtom(places2FilterAtom)

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const db = usePGlite()

    const level = place_id ? 7 : 5

    const filter = place_id ? places2Filter : places1Filter

    const where = filter.length > 1 ? { OR: filter } : filter[0]
    // console.log('hello Tree PlacesNode', {
    //   where,
    //   filter,
    //   whereApplied: {
    //     parent_id: place_id ?? null,
    //     subproject_id,
    //     ...(where?.path ? [where] : where),
    //   },
    // })
    const { results: places = [] } = useLiveQuery(
      db.places.liveMany({
        where: {
          parent_id: place_id ?? null,
          subproject_id,
          ...(where?.path ? [where] : where),
        },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: placesUnfiltered = [] } = useLiveQuery(
      db.places.liveMany({
        where: { parent_id: place_id ?? null, subproject_id },
        orderBy: { label: 'asc' },
      }),
    )
    const isFiltered = places.length !== placesUnfiltered.length

    const { results: placeLevels } = useLiveQuery(
      db.place_levels.liveMany({
        where: {
          project_id,
          level: place_id ? 2 : 1,
        },
        orderBy: { label: 'asc' },
      }),
    )
    const placeNamePlural = placeLevels?.[0]?.name_plural ?? 'Places'

    // get name by place_level
    const placesNode = useMemo(
      () => ({
        label: `${placeNamePlural} (${
          isFiltered
            ? `${places.length}/${placesUnfiltered.length}`
            : places.length
        })`,
      }),
      [isFiltered, placeNamePlural, places.length, placesUnfiltered.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        ...(place_id ? ['places', place_id] : []),
      ],
      [place_id, project_id, subproject_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'places'], [parentArray])
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
      isOpen,
      ownArray,
      parentArray,
      isInActiveNodeArray,
      urlPath.length,
      navigate,
      parentUrl,
      searchParams,
    ])

    return (
      <>
        <Node
          node={placesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={places.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          places.map((place) => (
            <PlaceNode
              key={place.place_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
