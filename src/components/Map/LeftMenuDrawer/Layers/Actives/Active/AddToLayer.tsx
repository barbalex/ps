import { useState } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import * as fluentUi from '@fluentui/react-components'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { TbPlus } from 'react-icons/tb'

import {
  mapCreationAtom,
  type MapCreation,
} from '../../../../../../modules/mapCreation.ts'
import {
  parentQuery,
  type CreationParent,
} from '../../../../../../modules/mapCreationParents.ts'
import { userIdAtom } from '../../../../../../store.ts'
import styles from './Content.module.css'

const {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
} = fluentUi
type Target = Pick<MapCreation, 'table' | 'level' | 'layerLabel' | 'projectId'>

export const AddToLayer = (target: Target) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({
    strict: false,
  })
  const userId = useAtomValue(userIdAtom)
  if (!userId || projectId !== target.projectId) return null
  const route = { subprojectId, placeId, placeId2 }
  return (
    <ParentChoice
      key={[
        userId,
        projectId,
        subprojectId,
        placeId,
        placeId2,
        target.table,
        target.level,
      ].join(':')}
      target={target}
      route={route}
      userId={userId}
    />
  )
}

const ParentChoice = ({
  target,
  route,
  userId,
}: {
  target: Target
  route: Parameters<typeof parentQuery>[1]
  userId: string
}) => {
  const { formatMessage } = useIntl()
  const setCreation = useSetAtom(mapCreationAtom)
  const [open, setOpen] = useState(false)
  const query = parentQuery(target, route, target.projectId, userId)
  const parent = useLiveQuery<CreationParent>(query.sql, query.params)?.rows[0]
  const choose = (parent: CreationParent) => {
    setOpen(false)
    setCreation({
      ...target,
      subprojectId: parent.subproject_id,
      placeId: parent.place_id,
    })
  }
  if (!parent) return null
  const label = formatMessage(
    {
      id: 'mapLayerAdd',
      defaultMessage: 'Zu {layer} hinzufügen',
    },
    { layer: target.layerLabel },
  )
  return (
    <>
      <Button
        as="a"
        appearance="subtle"
        size="small"
        icon={<TbPlus />}
        className={styles.headerButton}
        aria-label={label}
        title={label}
        onClick={(event) => {
          event.stopPropagation()
          if (query.preferredId === parent.id) choose(parent)
          else setOpen(true)
        }}
      />
      {open && (
        <ParentPicker
          query={parentQuery(target, route, target.projectId, userId, true)}
          subprojects={target.table === 'place' && target.level === 1}
          onChoose={choose}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

const ParentPicker = ({
  query,
  subprojects,
  onChoose,
  onClose,
}: {
  query: ReturnType<typeof parentQuery>
  subprojects: boolean
  onChoose: (parent: CreationParent) => void
  onClose: () => void
}) => {
  const { formatMessage } = useIntl()
  const [search, setSearch] = useState('')
  const [shown, setShown] = useState(50)
  const parents = useLiveQuery<CreationParent>(query.sql, query.params)?.rows
  const term = search.trim().toLocaleLowerCase()
  const matches = parents?.filter(({ label }) =>
    label.toLocaleLowerCase().includes(term),
  )
  const searchLabel = formatMessage({
    id: 'mapCreateParentSearch',
    defaultMessage: 'Suchen',
  })
  return (
    <Dialog
      open
      onOpenChange={(_, data) => {
        if (!data.open) onClose()
      }}
    >
      <DialogSurface onClick={(event) => event.stopPropagation()}>
        <DialogBody>
          <DialogTitle>
            {subprojects ?
              formatMessage({
                id: 'mapCreateParentSubproject',
                defaultMessage: 'Teilprojekt wählen',
              })
            : formatMessage({
                id: 'mapCreateParentPlace',
                defaultMessage: 'Ort wählen',
              })
            }
          </DialogTitle>
          <DialogContent>
            <Input
              aria-label={searchLabel}
              placeholder={searchLabel}
              value={search}
              onChange={(_, { value }) => {
                setSearch(value)
                setShown(50)
              }}
              className={styles.search}
            />
            <ul className={styles.parentList}>
              {matches?.slice(0, shown).map((row) => (
                <li key={row.id}>
                  <Button
                    appearance="subtle"
                    onClick={() => onChoose(row)}
                  >
                    {row.label}
                  </Button>
                </li>
              ))}
            </ul>
            {matches && matches.length > shown && (
              <Button onClick={() => setShown(shown + 50)}>
                {formatMessage({
                  id: 'mapCreateParentMore',
                  defaultMessage: 'Mehr anzeigen',
                })}
              </Button>
            )}
            {matches?.length === 0 &&
              formatMessage({
                id: 'mapCreateParentNone',
                defaultMessage: 'Keine Treffer',
              })}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>
              {formatMessage({
                id: 'mapCreateParentCancel',
                defaultMessage: 'Abbrechen',
              })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
