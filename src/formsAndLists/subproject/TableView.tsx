import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { JsonbOrFormDesign } from '../../components/shared/FormDesign/index.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { languageAtom } from '../../store.ts'

import '../../form.css'

/**
 * A single-row table view on a subproject (e.g. apflora's "Idealbiotop"):
 * a named form on the subproject row showing only the view's field group.
 * The Jsonb form renderer performs the writes on the subproject row itself.
 */
export const SubprojectTableView = () => {
  const { subprojectId, tableViewId } = useParams({
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
     WHERE tv.table_view_id = $1 AND tv.table_name = 'subprojects'`,
    [tableViewId],
  )
  const view = resView?.rows?.[0]
  const fieldIds = view?.sorted_field_ids ?? undefined

  const res = useLiveQuery<{ data: Record<string, unknown> | null }>(
    `SELECT data FROM subprojects WHERE subproject_id = $1`,
    [subprojectId],
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
            table="Teilprojekt"
            id={subprojectId}
          />
        : <JsonbOrFormDesign
            table="subprojects"
            idField="subproject_id"
            id={subprojectId!}
            data={row.data ?? {}}
            fieldIds={fieldIds}
          />
        }
      </div>
    </div>
  )
}
