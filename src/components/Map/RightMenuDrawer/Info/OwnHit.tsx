import { useEffect, useRef, type ReactNode } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { TooltipButton } from '../../../shared/TooltipButton.tsx'
import {
  useLocation,
  Outlet,
  useNavigate,
  useParams,
  useRouter,
} from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { MdEdit, MdOpenInNew } from 'react-icons/md'
import { TbZoomScan } from 'react-icons/tb'

import { Geometry } from '../../../FormMenu/Geometry.tsx'
import { ownFormRoute } from '../../../../modules/navigateToOwnForm.ts'
import { roleDependencies } from '../../../../modules/writeAccess.ts'
import {
  extentFromRow,
  extentSelect,
  extentToBoundsWithMargin,
  type ExtentRow,
} from '../../../../modules/geoQueries.ts'
import {
  mapBoundsAtom,
  mapInfoAtom,
  userIdAtom,
  type MapInfoLayer,
} from '../../../../store.ts'
import styles from './Layer.module.css'

type OwnTable = NonNullable<MapInfoLayer['ownTable']>
const tables = { place: 'places', check: 'checks', action: 'actions' } as const

export const OwnHit = ({
  layer,
  table,
  id,
  children,
}: {
  layer: MapInfoLayer
  table: OwnTable
  id: string
  children: ReactNode
}) => {
  const { formatMessage } = useIntl()
  const { projectId, placeId, placeId2, checkId, actionId } = useParams({
    strict: false,
  })
  const router = useRouter()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const setMapInfo = useSetAtom(mapInfoAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const userId = useAtomValue(userIdAtom)
  const tableName = tables[table]

  // Match the server's write scope: places require a writer on their
  // subproject/project; checks and actions can also use the place's role.
  const res = useLiveQuery<
    {
      place_id: string
      parent_id: string | null
      subproject_id: string
      can_edit: boolean
    } & ExtentRow
  >(
    `WITH ${roleDependencies}
     SELECT p.place_id, p.parent_id, sp.subproject_id,
       ${table === 'place' ? 'user_can_write_subproject(sp.subproject_id, $2)' : 'user_can_write_place(p.place_id, $2)'} AS can_edit,
       ${extentSelect('obj')}
     FROM ${tableName} obj JOIN places p ON p.place_id = obj.place_id
       LEFT JOIN places parent ON parent.place_id = p.parent_id
       JOIN subprojects sp ON sp.subproject_id = COALESCE(p.subproject_id, parent.subproject_id)
     WHERE obj.${table}_id = $1 AND sp.project_id = $3
     GROUP BY p.place_id, p.parent_id, sp.subproject_id, sp.project_id`,
    [id, userId ?? null, projectId ?? null],
  )
  const row = res?.rows[0]
  const extent = extentFromRow(row)
  const route =
    row &&
    projectId &&
    ownFormRoute(
      table,
      id,
      projectId,
      row.subproject_id,
      row.place_id,
      row.parent_id,
    )
  const selectedId =
    table === 'place' ? (placeId2 ?? placeId)
    : table === 'check' ? checkId
    : actionId
  const formPath = route && router.buildLocation(route).pathname
  const objectPath = formPath?.slice(0, formPath.lastIndexOf('/'))
  const section = objectPath && pathname.startsWith(`${objectPath}/`)
    ? pathname.slice(objectPath.length + 1).split('/')[0]
    : undefined
  const matches = selectedId === id && !!formPath && (
    pathname === formPath ||
    (table !== 'place' && (pathname === objectPath || section === '')) ||
    section === 'files' ||
    (table === 'place' ? section === 'users' : section === 'taxa' || section === 'quantities')
  )
  const formShown = row?.can_edit && layer.formActive && matches
  const selectRow = async () => {
    if (route && !matches) await navigate(route)
  }

  // Creation requests the editor before the new row is selected. Wait for
  // the local row and permission before selecting it, once per opening.
  const requested = useRef<MapInfoLayer | null>(null)
  useEffect(() => {
    if (layer.formActive && row?.can_edit && requested.current !== layer) {
      requested.current = layer
      void selectRow()
    }
  })

  const toggleForm = async () => {
    if (!formShown) await selectRow()
    setMapInfo((info) =>
      !info?.layers.includes(layer) ?
        info
      : {
          ...info,
          layers: info.layers.map((item) =>
            item === layer ? { ...item, formActive: !formShown }
            : item.formActive ? { ...item, formActive: false }
            : item,
          ),
        },
    )
  }
  return (
    <>
      <div className={styles.buttons}>
        <TooltipButton
          size="small"
          icon={<MdOpenInNew />}
          disabled={!route}
          onClick={() => route && navigate(route)}
          label={formatMessage({
            id: 'bMapInfoNavigateTo',
            defaultMessage: 'Zum Formular navigieren',
          })}
        />
        <TooltipButton
          size="small"
          icon={<TbZoomScan />}
          disabled={!extent}
          onClick={() =>
            extent && setMapBounds(extentToBoundsWithMargin(extent))
          }
          label={
            extent ?
              formatMessage({
                id: 'bMapInfoZoomTo',
                defaultMessage: 'Zum Objekt in Karte zoomen',
              })
            : formatMessage({
                id: 'bMapInfoZoomToNoGeometry',
                defaultMessage:
                  'Um auf ein Objekt zu zoomen, erstelle zuerst die Geometrie',
              })
          }
        />
        {row?.can_edit && (
          <>
            <Geometry
              rowId={id}
              table={tableName}
              level={row.parent_id ? 2 : 1}
              selectRow={selectRow}
            />
            <TooltipButton
              size="small"
              icon={<MdEdit />}
              onClick={toggleForm}
              label={formatMessage({
                id: '9NCbxo',
                defaultMessage: 'Formular anzeigen',
              })}
              aria-pressed={!!formShown}
              appearance={formShown ? 'primary' : 'secondary'}
            />
          </>
        )}
      </div>
      {formShown ?
        <div className={styles.objectForm}>
          <Outlet />
        </div>
      : children}
    </>
  )
}
