import { memo, useCallback } from 'react'
import { useAtom } from 'jotai'

import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { DbDump } from './DbDump.tsx'
import { breadcrumbsOverflowingAtom, navsOverflowingAtom } from '../../store.ts'

import '../form.css'

export const AppStates = memo(() => {
  const [breadcrumbsOverflowing, setBreadcrumbsOverflowing] = useAtom(
    breadcrumbsOverflowingAtom,
  )
  const toggleBreadcrumbsOverflowing = useCallback(
    () => setBreadcrumbsOverflowing(!breadcrumbsOverflowing),
    [breadcrumbsOverflowing, setBreadcrumbsOverflowing],
  )

  const [navsOverflowing, setNavsOverflowing] = useAtom(navsOverflowingAtom)
  const toggleNavsOverflowing = useCallback(
    () => setNavsOverflowing(!navsOverflowing),
    [navsOverflowing, setNavsOverflowing],
  )

  return (
    <div className="form-outer-container">
      <FormHeader title="Options" />
      <div className="form-container">
        <SwitchField
          label="Breadcrumbs overflowing"
          value={breadcrumbsOverflowing}
          onChange={toggleBreadcrumbsOverflowing}
          validationMessage="If true, breadcrumbs will only use a single line. When they overflow, the overflowing breadcrumbs will be collected in a menu on the left"
          autoFocus
        />
        <SwitchField
          label="Navs overflowing"
          value={navsOverflowing}
          onChange={toggleNavsOverflowing}
          validationMessage="If true, navs will only use a single line. When they overflow, the overflowing navs will be collected in a menu on the left"
        />
        <DbDump />
      </div>
    </div>
  )
})
