import { Puck } from '@puckeditor/core'
import type { Config, Data } from '@puckeditor/core'

import { DesignEditorLayout } from './DesignEditorLayout.tsx'
import { PuckDrawerItem } from './PuckDrawerItem.tsx'
import { PuckCheckboxField } from './PuckCheckboxField.tsx'

type Props = {
  config: Config
  data: Data
  onChange: (data: Data) => void
  // rendered above the component drawer / the page preview, e.g. the editors'
  // warnings and empty-design hints
  sidebarExtra?: React.ReactNode
  previewExtra?: React.ReactNode
}

/**
 * The Puck design editor, only reachable through the lazy boundary in
 * lazyPuck.tsx so its bundle loads on the design routes only. Everything
 * that imports @puckeditor/core at runtime must live in or below this
 * module: the Puck component, the custom layout (DesignEditorLayout with
 * the PuckPropsPanel) and the override components.
 */
export const PuckEditor = ({
  config,
  data,
  onChange,
  sidebarExtra,
  previewExtra,
}: Props) => (
  <Puck
    config={config}
    data={data}
    onChange={onChange}
    // no iframe so the data blocks reach the app's contexts (live queries)
    iframe={{ enabled: false }}
    overrides={{
      drawerItem: PuckDrawerItem,
      fieldTypes: { checkbox: PuckCheckboxField },
    }}
  >
    <DesignEditorLayout
      sidebar={
        <>
          {sidebarExtra}
          <Puck.Components />
        </>
      }
      preview={
        <>
          {previewExtra}
          <Puck.Preview />
        </>
      }
    />
  </Puck>
)
