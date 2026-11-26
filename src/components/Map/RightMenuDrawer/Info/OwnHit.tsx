import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { TooltipButton } from '../../../shared/TooltipButton.tsx'
import {
  useLocation,
  Outlet,
  useNavigate,
  useParams,
  useRouter,
} from '@tanstack/react-router'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { MdEdit, MdOpenInNew } from 'react-icons/md'
import { TbZoomScan } from 'react-icons/tb'

import { Geometry } from '../../../FormMenu/Geometry.tsx'
import { observationFormRoute, ownFormRoute } from '../../../../modules/navigateToOwnForm.ts'
import { usePaneVisibility } from '../../../LayoutProtected/usePaneVisibility.ts'
import { MapInfoFormRoot } from '../../../../modules/mapInfoFormContext.ts'
import { useOwnLayerScope } from '../../../../modules/useOwnLayerScope.ts'
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
  mapInfoPreferFormAtom,
  userIdAtom,
  type MapInfoLayer,
} from '../../../../store.ts'
import styles from './Layer.module.css'

type OwnTable = NonNullable<MapInfoLayer['ownTable']>
const tables = { place: 'places', check: 'checks', action: 'actions', observation: 'observations' } as const

export const OwnHit = ({
  layer,
  table,
  id,
  children,
}: {
  layer: MapInfoLayer
  table: OwnTable | 'observation'
  id: string
  children: ReactNode
}) => {
  const { formatMessage } = useIntl()
  const { projectId, placeId, placeId2, checkId, actionId, observationId } = useParams({
    strict: false,
  })
  const router = useRouter()
  const navigate = useNavigate()
  const { formSearch } = useOwnLayerScope()
  const { treeVisible, dataVisible, mapVisible } = usePaneVisibility()
  const mapOnly = mapVisible && !treeVisible && !dataVisible
  const { pathname } = useLocation()
  const [info, setMapInfo] = useAtom(mapInfoAtom)
  const [preferForm, setPreferForm] = useAtom(mapInfoPreferFormAtom)
  const setMapBounds = useSetAtom(mapBoundsAtom)
  const userId = useAtomValue(userIdAtom)
  const tableName = tables[table]

  // Match the server's write scope: places require a writer on their
  // subproject/project; checks and actions can also use the place's role.
  const res = useLiveQuery<
    {
      place_id: string | null
      not_to_assign: boolean | null
      parent_id: string | null
      subproject_id: string
      can_edit: boolean
    } & ExtentRow
  >(
    table === 'observation' ? `WITH ${roleDependencies}
     SELECT obj.place_id, obj.not_to_assign, p.parent_id, sp.subproject_id,
       CASE WHEN obj.place_id IS NULL THEN user_can_write_subproject(sp.subproject_id, $2)
         ELSE user_can_write_place(obj.place_id, $2) END AS can_edit,
       ${extentSelect('obj')}
     FROM observations obj JOIN observation_imports i USING (observation_import_id)
       JOIN subprojects sp USING (subproject_id)
       LEFT JOIN places p ON p.place_id = obj.place_id
     WHERE obj.observation_id = $1 AND sp.project_id = $3
     GROUP BY obj.observation_id, p.parent_id, sp.subproject_id`
    : `WITH ${roleDependencies}
     SELECT p.place_id, p.parent_id, sp.subproject_id, NULL::boolean AS not_to_assign,
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
    (table === 'observation' ?
      observationFormRoute(projectId, row.subproject_id, id, row.place_id, row.parent_id, row.not_to_assign)
    : row.place_id ? ownFormRoute(
      table,
      id,
      projectId,
      row.subproject_id,
      row.place_id,
      row.parent_id,
    ) : undefined)
  const selectedId =
    table === 'place' ? (placeId2 ?? placeId)
    : table === 'check' ? checkId
    : table === 'observation' ? observationId : actionId
  const formPath = route && router.buildLocation(route).pathname
  const objectPath = table === 'observation' ? formPath : formPath?.slice(0, formPath.lastIndexOf('/'))
  const section = objectPath && pathname.startsWith(`${objectPath}/`)
    ? pathname.slice(objectPath.length + 1).split('/')[0]
    : undefined
  const matches = selectedId === id && !!formPath && (
    pathname === formPath ||
    (table !== 'place' && (pathname === objectPath || section === '')) ||
    section === 'files' ||
    (table === 'place' ? section === 'users' : section === 'taxa' || section === 'quantities')
  )
  const insideMapForm = mapOnly && !!objectPath &&
    (pathname === objectPath || pathname.startsWith(`${objectPath}/`))
  const [lastShown, setLastShown] = useState<MapInfoLayer | null>(null)
  const enteringChoice = info?.selectedHit !== undefined && lastShown !== layer
  const formShown = row?.can_edit && layer.formActive && (matches || (insideMapForm && !enteringChoice))
  const selectRow = useCallback(async () => {
    if (route && !matches) await navigate({ ...route, search: formSearch })
  }, [route, matches, navigate, formSearch])

  // Open the editor only after this hit's write permission is known.
  useEffect(() => {
    if (!preferForm || !row?.can_edit || layer.formActive) return
    setMapInfo((info) => {
      if (!info || info.browsing || !info.layers.includes(layer) ||
        info.layers.some((item) => item.formActive)) return info
      return {
        ...info,
        layers: info.layers.map((item) => item === layer ? { ...item, formActive: true } : item),
      }
    })
  }, [preferForm, row?.can_edit, layer, setMapInfo])

  // A new hit or creation may request the editor before its route is selected.
  const requested = useRef<MapInfoLayer | null>(null)
  useEffect(() => {
    if (layer.formActive && row?.can_edit && requested.current !== layer) {
      requested.current = layer
      if ((!insideMapForm || enteringChoice) && !matches) void selectRow()
    }
  }, [layer, row?.can_edit, insideMapForm, enteringChoice, matches, selectRow])

  // Navigation can finish before the outlet paints. Only show properties
  // for a confirmed table view, never as the pending editor's fallback.
  const wantsForm = layer.formActive || (
    preferForm && !info?.browsing && !info?.layers.some((item) => item.formActive)
  )
  useEffect(() => {
    if (formShown) setLastShown(layer)
  }, [formShown, layer])
  // In split view the user can navigate the Data pane away from an
  // already-open editor. Its map hit remains inspectable.
  const showProperties = row && (!row.can_edit || !wantsForm || lastShown === layer)

  const toggleForm = () => {
    setPreferForm(!formShown)
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
          onClick={() => route && navigate({ ...route, search: formSearch })}
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
            {tableName !== 'observations' && <Geometry
              rowId={id}
              table={tableName}
              level={row.parent_id ? 2 : 1}
              selectRow={selectRow}
            />}
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
          <MapInfoFormRoot.Provider value={mapOnly ? objectPath : undefined}>
            <Outlet />
          </MapInfoFormRoot.Provider>
        </div>
      : showProperties ? children : null}
    </>
  )
}
