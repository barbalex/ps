import { Suspense, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useAtomValue } from 'jotai'
import type { Data } from '@puckeditor/core'

import { LazyPuckRender } from '../lazyPuck.tsx'
import { Loading } from '../Loading.tsx'
import { normalizePuckDesign } from '../../../modules/normalizePuckDesign.ts'
import { languageAtom } from '../../../store.ts'
import type { FieldsWithTypes } from '../Jsonb/index.tsx'

import {
  buildFormDesignConfig,
  type FormDesignLabels,
} from './buildFormDesignConfig.tsx'
import {
  FormDesignRuntimeContext,
  type FormDesignMode,
} from './FormDesignRuntimeContext.tsx'

/**
 * Renders a saved form design with live widgets writing the row's jsonb —
 * the designed counterpart of the auto-generated Jsonb form. `mode` 'print'
 * renders the same design read-only for the print view.
 */
export const FormFromDesign = ({
  design,
  fields,
  data,
  mode,
  table,
  jsonFieldName = 'data',
  idField,
  id,
}: {
  design: unknown
  fields: FieldsWithTypes[]
  data: Record<string, unknown>
  mode: FormDesignMode
  table: string
  jsonFieldName?: string
  idField: string
  id: string
}) => {
  const { formatMessage } = useIntl()
  const language = useAtomValue(languageAtom)

  // the config must keep its identity while the user types: Puck remounts
  // the rendered components when the render functions change, losing focus
  const fieldsKey = fields
    .map(
      (f) =>
        `${f.field_id}/${f.field_label ?? ''}/${f.name ?? ''}/${f.widget_type ?? ''}/${f.list_id ?? ''}`,
    )
    .join('|')
  const labels: FormDesignLabels = {
    layout: formatMessage({ id: 'bFgHiA', defaultMessage: 'Layout' }),
    fields: formatMessage({ id: 'bC8AbC', defaultMessage: 'Felder' }),
    grid: formatMessage({ id: 'bFhIjB', defaultMessage: 'Raster' }),
    heading: formatMessage({ id: 'bFiJkC', defaultMessage: 'Titel' }),
    image: formatMessage({ id: 'bFjKlD', defaultMessage: 'Bild' }),
    spacer: formatMessage({ id: 'bFkLmE', defaultMessage: 'Abstand' }),
    pageBreak: formatMessage({
      id: 'bFlMnF',
      defaultMessage: 'Seitenumbruch',
    }),
  }
  const config = useMemo(() => {
    return buildFormDesignConfig({ fields, labels })
    // labels derive from the language; fieldsKey captures the field
    // definitions — rebuilding on either is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsKey, language])

  const fieldsById = useMemo(() => {
    return Object.fromEntries(fields.map((f) => [f.field_id as string, f]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsKey])
  const runtime = {
    fields: fieldsById,
    data,
    mode,
    table,
    jsonFieldName,
    idField,
    id,
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
