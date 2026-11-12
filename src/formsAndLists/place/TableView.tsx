import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { JsonbOrFormDesign } from '../../components/shared/FormDesign/index.tsx'
import { WithFormDesign } from '../../components/shared/FormDesign/WithFormDesign.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { languageAtom } from '../../store.ts'

import '../../form.css'

/**
 * A single-row table view on a place (e.g. a "Biotop" form on a
 * Teil-Population): a named form on the place row showing only the view's
 * field group. The Jsonb form renderer performs the writes on the place
 * row itself.
 */
export const PlaceTableView = () => {
  const { placeId, placeId2, tableViewId } = useParams({
    strict: false,
  })
  const [language] = useAtom(languageAtom)

  // the view: names + field group (same join the check view uses)
  const resView = useLiveQuery<{
    name_singular_de: string | null
    name_singular_en: string | null
    name_singular_fr: string | null
    name_singular_it: string | null
    sorted_field_ids: string[] | null
  }>(
    `SELECT tv.name_singular_de, tv.name_singular_en, tv.name_singular_fr, tv.name_singular_it,
        fg.sorted_field_ids
     FROM table_views tv
     LEFT JOIN field_groups fg ON fg.field_group_id = tv.field_group_id
     WHERE tv.table_view_id = $1 AND tv.table_name = 'places'`,
    [tableViewId],
  )
  const view = resView?.rows?.[0]
  const fieldIds = view?.sorted_field_ids ?? undefined

  const res = useLiveQuery<{ data: Record<string, unknown> | null }>(
    `SELECT data FROM places WHERE place_id = $1`,
    [placeId2 ?? placeId],
  )
  const row = res?.rows?.[0]

  const loading = res === undefined || resView === undefined
  const notFound = !!resView && !view
  const title =
    notFound ? undefined : (
      (view?.[`name_singular_${language}`] ??
      view?.name_singular_de ??
      tableViewId)
    )

  return (
    <div className="form-outer-container">
      <FormHeader
        title={title}
        tableName="tableView"
      />
      <div className="form-container">
        {loading ?
          <Loading />
        : notFound ?
          <NotFound
            table="Ansicht"
            id={tableViewId}
          />
        : !row ?
          <NotFound
            table="Ort"
            id={placeId2 ?? placeId}
          />
        : <WithFormDesign
            table="places"
            idField="place_id"
            id={(placeId2 ?? placeId)!}
            data={row.data ?? {}}
          >
            <JsonbOrFormDesign
              table="places"
              idField="place_id"
              id={(placeId2 ?? placeId)!}
              data={row.data ?? {}}
              fieldIds={fieldIds}
            />
          </WithFormDesign>
        }
      </div>
    </div>
  )
}
