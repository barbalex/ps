import { Suspense, useMemo } from 'react'
import type { Data } from '@puckeditor/core'

import { LazyPuckRender } from '../lazyPuck.tsx'
import { Loading } from '../Loading.tsx'
import { normalizePuckDesign } from '../../../modules/normalizePuckDesign.ts'
import type { FieldChangeHandler } from '../fieldChange.ts'
import type { FieldsWithTypes } from '../Jsonb/index.tsx'

import {
  FormDesignRuntimeContext,
  type FormColumns,
  type FormDesignMode,
} from './FormDesignRuntimeContext.tsx'
import { useFormDesignConfig } from './useFormDesignConfig.tsx'

/**
 * Renders a saved form design with live widgets writing the row — jsonb keys
 * and real columns alike; the designed counterpart of the auto-generated
 * Jsonb form. `mode` 'print' renders the same design read-only for the print
 * view.
 */
export const FormFromDesign = ({
  design,
  fields,
  columns,
  onChange,
  data,
  mode,
  table,
  jsonFieldName = 'data',
  idField,
  id,
}: {
  design: unknown
  fields: FieldsWithTypes[]
  /** the form's real columns — the design may place them */
  columns?: FormColumns
  /** the form's change handler — writes the real columns in live mode */
  onChange?: FieldChangeHandler
  data: Record<string, unknown>
  mode: FormDesignMode
  table: string
  jsonFieldName?: string
  idField: string
  id: string
}) => {
  // the config must keep its identity while the user types: Puck remounts
  // the rendered components when the render functions change, losing focus
  const config = useFormDesignConfig({ fields, columns })

  const fieldsById = useMemo(() => {
    return Object.fromEntries(fields.map((f) => [f.field_id as string, f]))
  }, [fields])
  const runtime = {
    fields: fieldsById,
    data,
    mode,
    table,
    jsonFieldName,
    idField,
    id,
    columns,
    onChange,
  }

  return (
    <FormDesignRuntimeContext.Provider value={runtime}>
      <Suspense fallback={<Loading />}>
        <LazyPuckRender
          config={config}
          data={normalizePuckDesign(design ?? { content: [] }) as Data}
        />
      </Suspense>
    </FormDesignRuntimeContext.Provider>
  )
}
