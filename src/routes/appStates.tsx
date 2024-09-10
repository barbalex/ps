import { memo } from 'react'
import { useAtom } from 'jotai'

import { SwitchField } from '../components/shared/SwitchField.tsx'
import { FormHeader } from '../components/FormHeader/index.tsx'
import { breadcrumbsOverflowingAtom, navsOverflowingAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [breadcrumbsOverflowing, setBreadcrumbsOverflowing] = useAtom(
    breadcrumbsOverflowingAtom,
  )
  const [navsOverflowing, setNavsOverflowing] = useAtom(navsOverflowingAtom)

  return (
    <div className="form-outer-container">
      <FormHeader title="Options" />
      <div className="form-container">
        <SwitchField
          label="Breadcrumbs overflowing"
          value={breadcrumbsOverflowing}
          onChange={() => setBreadcrumbsOverflowing(!breadcrumbsOverflowing)}
          validationMessage="If true, breadcrumbs will only use a single line. When they overflow, the overflowing breadcrumbs will be collected in a menu on the left"
          autoFocus
        />
        <SwitchField
          label="Navs overflowing"
          value={navsOverflowing}
          onChange={() => setNavsOverflowing(!navsOverflowing)}
          validationMessage="If true, navs will only use a single line. When they overflow, the overflowing navs will be collected in a menu on the left"
        />
      </div>
    </div>
  )
})
