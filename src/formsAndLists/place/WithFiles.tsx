import { useRef, useState, useContext } from 'react'
import {
  useParams,
  useSearch,
  useNavigate,
  useLocation,
  Outlet,
} from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom, useAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { Header } from './Header.tsx'
import { PlaceForm as Form } from './Form.tsx'
import { PlaceUsers } from '../placeUsers.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { createPlaceUser } from '../../modules/createRows.ts'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { FilterButton } from '../../components/shared/FilterButton.tsx'
import {
  addOperationAtom,
  languageAtom,
  designingAtom,
  placeUsers1FilterAtom,
  placeUsers2FilterAtom,
  filesFilterAtom,
} from '../../store.ts'
import { UploaderContext } from '../../UploaderContext.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'
import type Places from '../../models/public/Places.ts'

import '../../form.css'

const { Button } = fluentUiReactComponents

export const PlaceWithFiles = ({ from }: { from: string }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({
    strict: false,
  })
  const { onlyForm } = useSearch({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [language] = useAtom(languageAtom)
  const [isDesigning] = useAtom(designingAtom)
  const [placeUsersFilter] = useAtom(
    placeId2 ? placeUsers2FilterAtom : placeUsers1FilterAtom,
  )
  const [filesFilter] = useAtom(filesFilterAtom)
  const { formatMessage } = useIntl()
  const newLabel = formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const currentPlaceId = placeId2 ?? placeId

  const db = usePGlite()
  const res = useLiveQuery(
    `
    SELECT
      *
    FROM
      places
    WHERE place_id = $1`,
    [currentPlaceId],
  )
  const row: Places | undefined = res?.rows?.[0]

  const nameRes = useLiveQuery(
    `
    SELECT
      place_level_id,
      name_singular_${language},
      name_plural_${language}
    FROM place_levels
    WHERE
      project_id = $1
      AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevels = nameRes?.rows ?? []
  const nameSingular =
    placeLevels?.[0]?.[`name_singular_${language}`] ?? 'Place'
  const namePlural = placeLevels?.[0]?.[`name_plural_${language}`] ?? 'Places'

  const placeLevelRes = useLiveQuery(
    `SELECT place_users_in_place, place_files FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = placeLevelRes?.rows?.[0]
  const usersInPlace = placeLevel?.place_users_in_place !== false
  const showFiles = isDesigning || placeLevel?.place_files !== false

  const placeUsersCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM place_users WHERE place_id = $1`,
    [currentPlaceId],
  )
  const placeUsersCount = placeUsersCountRes?.rows?.[0]?.count ?? 0

  const filesCountRes = useLiveQuery(
    `SELECT count(*)::int AS count FROM files WHERE place_id = $1`,
    [currentPlaceId],
  )
  const filesCount = filesCountRes?.rows?.[0]?.count ?? 0

  const isUsersOpen =
    location.pathname.endsWith('/users') ||
    location.pathname.includes('/users/')
  const isUsersList = /\/users\/?$/.test(location.pathname)
  const isFilesOpen =
    location.pathname.endsWith('/files') ||
    location.pathname.includes('/files/')
  const isFilesList = /\/files\/?$/.test(location.pathname)

  const placeBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}${placeId2 ? `/places/${placeId2}` : ''}`
  const placeUrl = `${placeBaseUrl}/place`
  const usersUrl = `${placeBaseUrl}/users`
  const filesUrl = `${placeBaseUrl}/files`

  const placeUsersIsFiltered = !!filterStringFromFilter(placeUsersFilter)
  const filesIsFiltered = !!filterStringFromFilter(filesFilter)
  const uploaderCtx = useContext(UploaderContext)
  const uploaderApi = uploaderCtx?.current?.getAPI?.()
  const onClickAddPlaceUser = async () => {
    const id = await createPlaceUser({ placeId: currentPlaceId })
    if (!id) return
    navigate({ to: `${usersUrl}/${id}/` })
  }
  const onClickAddFile = () => uploaderApi?.initFlow?.()

  const placeUserHeaderActions =
    isDesigning && usersInPlace && isUsersList ? (
      <>
        <FilterButton isFiltered={placeUsersIsFiltered} />
        <Button
          size="medium"
          title={newLabel}
          icon={<FaPlus />}
          onClick={onClickAddPlaceUser}
        />
      </>
    ) : undefined

  const fileHeaderActions =
    showFiles && isFilesList ? (
      <>
        <FilterButton isFiltered={filesIsFiltered} />
        <Button
          size="medium"
          title={newLabel}
          icon={<FaPlus />}
          onClick={onClickAddFile}
        />
      </>
    ) : undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return

    try {
      await db.query(`UPDATE places SET ${name} = $1 WHERE place_id = $2`, [
        value,
        currentPlaceId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'places',
      rowIdName: 'place_id',
      rowId: currentPlaceId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table={nameSingular} id={currentPlaceId} />
  }

  if (onlyForm) {
    return (
      <Form
        row={row}
        onChange={onChange}
        validations={validations}
        autoFocusRef={autoFocusRef}
        from={from}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
        nameSingular={nameSingular}
        namePlural={namePlural}
      />
      <div className="form-container">
        <Form
          row={row}
          onChange={onChange}
          validations={validations}
          autoFocusRef={autoFocusRef}
          from={from}
          withContainer={false}
        />
        {isDesigning && usersInPlace ? (
          <Section
            title={`${formatMessage({ id: 'eZ3yEB', defaultMessage: 'Benutzer' })} (${placeUsersCount})`}
            parentUrl={placeUrl}
            listUrl={usersUrl}
            isOpen={isUsersOpen}
            titleStyle={{ marginBottom: 0 }}
            childrenStyle={{ marginLeft: -10, marginRight: -10 }}
            headerActions={placeUserHeaderActions}
          >
            {isUsersOpen &&
              (isUsersList ? (
                <PlaceUsers from={from} hideHeader />
              ) : (
                <Outlet />
              ))}
          </Section>
        ) : (
          isUsersOpen && <Outlet />
        )}
        {showFiles ? (
          <Section
            title={`${formatMessage({ id: 'mn58Sh', defaultMessage: 'Dateien' })} (${filesCount})`}
            parentUrl={placeUrl}
            listUrl={filesUrl}
            isOpen={isFilesOpen}
            titleStyle={{ marginBottom: 0 }}
            childrenStyle={{ marginLeft: -10, marginRight: -10 }}
            headerActions={fileHeaderActions}
          >
            {isFilesOpen && <Outlet />}
          </Section>
        ) : (
          isFilesOpen && <Outlet />
        )}
      </div>
    </div>
  )
}
