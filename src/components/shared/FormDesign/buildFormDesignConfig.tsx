import type { Config } from '@puckeditor/core'

import type { FieldsWithTypes } from '../Jsonb/index.tsx'
import {
  columnComponentType,
  fieldComponentType,
} from '../../../modules/formDesignComponents.ts'

import { FieldWidget } from './FieldWidget.tsx'
import { ColumnWidget } from './ColumnWidget.tsx'
import { Grid, Heading, FormImage, Spacer, PageBreak } from './components.tsx'
import type { FormColumns } from './FormDesignRuntimeContext.tsx'

export type FormDesignLabels = {
  /** drawer category holding the layout components */
  layout: string
  /** drawer category holding the field components */
  fields: string
  grid: string
  heading: string
  image: string
  spacer: string
  pageBreak: string
}

const columnOptions = [2, 3, 4, 6].map((n) => ({
  label: `${n}`,
  value: n,
}))

/**
 * Builds the Puck config of a form design: one component per field of the
 * table — its real columns and its jsonb keys alike — plus the layout
 * components (grid, heading, image, …). Used by both the design editor (the
 * widgets render from the runtime context but write nothing) and the runtime
 * renderer.
 *
 * The field render functions only close over the field or column name — the
 * row binding comes from FormDesignRuntimeContext — so the config identity
 * stays stable while the user types (Puck would remount every widget
 * otherwise).
 */
export const buildFormDesignConfig = ({
  fields,
  columns,
  labels,
}: {
  fields: FieldsWithTypes[]
  columns?: FormColumns
  labels: FormDesignLabels
}): Config => {
  const components: Record<string, unknown> = {
    Grid: {
      label: labels.grid,
      fields: {
        children: { type: 'slot' },
        columns: {
          type: 'select',
          options: columnOptions,
        },
        gap: {
          type: 'number',
          min: 0,
          max: 48,
        },
      },
      defaultProps: { columns: 3, gap: 12 },
      render: Grid,
    },
    Heading: {
      label: labels.heading,
      fields: {
        text: { type: 'text' },
        level: {
          type: 'select',
          options: [
            { label: 'H2', value: 2 },
            { label: 'H3', value: 3 },
            { label: 'H4', value: 4 },
          ],
        },
      },
      defaultProps: { level: 3 },
      render: Heading,
    },
    FormImage: {
      label: labels.image,
      fields: {
        src: { type: 'image' },
        alt: { type: 'text' },
        width: {
          type: 'select',
          options: ['25%', '50%', '75%', '100%'].map((w) => ({
            label: w,
            value: w,
          })),
        },
      },
      defaultProps: { width: '50%' },
      render: FormImage,
    },
    Spacer: {
      label: labels.spacer,
      fields: {
        height: { type: 'number', min: 8, max: 200 },
      },
      defaultProps: { height: 24 },
      render: Spacer,
    },
    PageBreak: {
      label: labels.pageBreak,
      fields: {},
      render: PageBreak,
    },
  }
  const columnEntries = Object.entries(columns ?? {})
  const categories: Record<string, { title: string; components: string[] }> = {
    layout: {
      title: labels.layout,
      components: ['Grid', 'Heading', 'FormImage', 'Spacer', 'PageBreak'],
    },
    // the table's own columns first, then its jsonb keys
    fields: {
      title: labels.fields,
      components: [
        ...columnEntries.map(([name]) => columnComponentType(name)),
        ...fields.map((field) => fieldComponentType(field.field_id)),
      ],
    },
  }

  for (const [name, column] of columnEntries) {
    components[columnComponentType(name)] = {
      label: column.label,
      fields: {},
      render: () => <ColumnWidget name={name} />,
    }
  }

  for (const field of fields) {
    const componentName = fieldComponentType(field.field_id)
    components[componentName] = {
      label: field.field_label || field.name,
      fields: {},
      render: () => <FieldWidget field={field} />,
    }
  }

  return { components, categories } as unknown as Config
}
