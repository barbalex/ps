import { useLocation, useParams, useSearch } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { designingAtom } from '../../../store.ts'

import { FormDesignEditor } from './FormDesignEditor.tsx'
import { useFormDesignRow } from './useFormDesignRow.ts'
import { useFormDesignFields } from './useFormDesignFields.ts'

/**
 * Renders the form design editor in place of the WHOLE form (header fields
 * like date and switches included) while it is open — the editor replaces
 * the form area instead of squeezing in below its fixed fields. The editor
 * opens via the `formDesign` search param, set by the design toolbar in
 * JsonbOrFormDesign; any other state renders the children unchanged.
 */
export const WithFormDesign = ({
  table,
  idField,
  id,
  data,
  from,
  children,
}: {
  table: string
  idField: string
  id?: string
  data: Record<string, unknown>
  from?: string
  children: React.ReactNode
}) => {
  const { projectId, tableViewId } = useParams({ strict: false })
  const location = useLocation()
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const { formDesign } = useSearch({ strict: false }) as {
    formDesign?: string
  }

  const isFilter = location.pathname.endsWith('filter')
  const isHistory = from?.includes('histories') ?? false
  const editorOpen =
    !!formDesign && designing && !!projectId && !!id && !isFilter && !isHistory

  const designRow = useFormDesignRow({
    projectId: projectId ?? undefined,
    table,
    tableViewId,
  })
  const fields = useFormDesignFields({ table, enabled: editorOpen })

  if (editorOpen && designRow) {
    return (
      <FormDesignEditor
        designRow={designRow}
        fields={fields}
        data={data}
        table={table}
        idField={idField}
        id={id}
      />
    )
  }
  return children
}
