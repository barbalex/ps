import type { Config } from '@puckeditor/core'

import type { FieldsWithTypes } from '../Jsonb/index.tsx'

import { FieldWidget } from './FieldWidget.tsx'
import { Grid, Heading, FormImage, Spacer, PageBreak } from './components.tsx'

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
 * table plus the layout components (grid, heading, image, …). Used by both
 * the design editor (the widgets render from the runtime context but write
 * nothing) and the runtime renderer.
 *
 * The field render functions only close over the field definition — the row
 * binding comes from FormDesignRuntimeContext — so the config identity
 * stays stable while the user types (Puck would remount every widget
 * otherwise).
 */
export const buildFormDesignConfig = ({
  fields,
  labels,
}: {
  fields: FieldsWithTypes[]
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
  const categories: Record<string, { title: string; components: string[] }> = {
    layout: {
      title: labels.layout,
      components: ['Grid', 'Heading', 'FormImage', 'Spacer', 'PageBreak'],
    },
    fields: { title: labels.fields, components: [] },
  }

  for (const field of fields) {
    const componentName = `field_${field.field_id}`
    components[componentName] = {
      label: field.field_label || field.name,
      fields: {},
      render: () => <FieldWidget field={field} />,
    }
    categories.fields!.components.push(componentName)
  }

  return { components, categories } as unknown as Config
}

/**
 * The field_ids placed anywhere in a design — root content and grid slots —
 * used to warn about fields that exist but are not placed (they would be
 * invisible to users of the designed form).
 */
export const placedFieldIds = (
  design: unknown,
  placed = new Set<string>(),
): Set<string> => {
  const items = (design as { content?: unknown[] } | null)?.content
  if (!Array.isArray(items)) return placed
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    const { type, props } = item as {
      type?: unknown
      props?: Record<string, unknown>
    }
    if (typeof type === 'string' && type.startsWith('field_')) {
      placed.add(type.slice('field_'.length))
    }
    // slots hold nested item arrays (e.g. the Grid's children)
    if (props) {
      for (const value of Object.values(props)) {
        if (Array.isArray(value) && value.length) {
          placedFieldIds({ content: value }, placed)
        }
      }
    }
  }
  return placed
}
