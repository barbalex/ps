import * as fluentUiReactComponents from '@fluentui/react-components'
import { BsGlobe2 } from 'react-icons/bs'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import {
  addNotificationAtom,
  addOperationAtom,
  personalMapCrsAtom,
} from '../../../../../store.ts'
import type { useMapCoordinatesCrs } from '../../../../../modules/useMapCoordinatesCrs.ts'

const {
  Tooltip,
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuPopover,
  MenuItemRadio,
  MenuGroupHeader,
  MenuItem,
} = fluentUiReactComponents

export const ChooseCrs = ({
  crs,
}: {
  crs: NonNullable<ReturnType<typeof useMapCoordinatesCrs>>
}) => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const notify = useSetAtom(addNotificationAtom)
  const setPersonal = useSetAtom(personalMapCrsAtom)
  const { formatMessage } = useIntl()
  const label = formatMessage({
    id: 'Qb3CdE',
    defaultMessage: 'KBS auswählen (Koordinaten-Bezugs-System)',
  })

  const choose = async (code: string) => {
    if (crs.code === code) return
    const { key, projectId } = crs
    if (!crs.shared) {
      if (key) setPersonal((prev) => ({ ...prev, [key]: code }))
      return
    }
    if (!projectId) return
    try {
      const {
        rows: [prev],
      } = await db.query<Record<string, unknown>>(
        'SELECT project_id, map_presentation_crs, updated_at, updated_by FROM projects WHERE project_id = $1',
        [projectId],
      )
      await db.query(
        'UPDATE projects SET map_presentation_crs = $1 WHERE project_id = $2',
        [code, projectId],
      )
      await addOperation({
        table: 'projects',
        rowIdName: 'project_id',
        rowId: projectId,
        operation: 'update',
        draft: { map_presentation_crs: code },
        prev,
      })
    } catch (error) {
      notify({
        intent: 'error',
        body: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <Menu
      checkedValues={{ crs: [crs.code] }}
      onCheckedValueChange={(_, { checkedItems }) => {
        if (checkedItems[0]) void choose(checkedItems[0])
      }}
    >
      <MenuTrigger disableButtonEnhancement>
        <Tooltip
          content={label}
          relationship="label"
        >
          <Button
            icon={<BsGlobe2 />}
            size="small"
            aria-label={label}
          />
        </Tooltip>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuGroupHeader>
            {crs.shared ?
              formatMessage({
                id: 'mapCrsShared',
                defaultMessage: 'Projektstandard für alle',
              })
            : formatMessage({
                id: 'mapCrsPersonal',
                defaultMessage: 'Nur für mich auf diesem Gerät',
              })
            }
          </MenuGroupHeader>
          {Array.from(crs.options.values(), ({ code, name }) => (
            <MenuItemRadio
              key={code}
              name="crs"
              value={code}
              secondaryContent={code}
            >
              {name ?? code}
            </MenuItemRadio>
          ))}
          {crs.options.size === 1 && (
            <MenuItem disabled>
              {formatMessage({
                id: 'mapCrsConfigure',
                defaultMessage:
                  'Weitere Koordinaten-Bezugs-Systeme müssen zuerst im Projekt konfiguriert werden.',
              })}
            </MenuItem>
          )}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}
