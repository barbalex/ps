import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'
import type { Config } from '@puckeditor/core'

import { languageAtom } from '../../../store.ts'
import type { FieldsWithTypes } from '../Jsonb/index.tsx'

import {
  buildFormDesignConfig,
  type FormDesignLabels,
} from './buildFormDesignConfig.tsx'
import type { FormColumns } from './FormDesignRuntimeContext.tsx'

/**
 * The Puck config of a form design, for the design editor and the runtime
 * renderer alike. It keeps its identity while the user types — Puck remounts
 * the rendered components when the config changes, losing focus — and is
 * rebuilt only when the language or a field or column definition changes.
 */
export const useFormDesignConfig = ({
  fields,
  columns,
}: {
  fields: FieldsWithTypes[]
  columns?: FormColumns
}): Config => {
  const { formatMessage } = useIntl()
  const language = useAtomValue(languageAtom)

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
  const fieldsKey = fields
    .map(
      (f) =>
        `${f.field_id}/${f.field_label ?? ''}/${f.name ?? ''}/${f.field_type ?? ''}/${f.widget_type ?? ''}/${f.list_id ?? ''}`,
    )
    .join('|')
  const columnsKey = Object.entries(columns ?? {})
    .map(([name, column]) => `${name}/${column.label}`)
    .join('|')

  return useMemo(() => {
    return buildFormDesignConfig({ fields, columns, labels })
    // labels derive from the language; the keys capture the field and
    // column definitions — rebuilding on either is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsKey, columnsKey, language])
}
