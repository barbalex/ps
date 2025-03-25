import { memo, useCallback } from 'react'
import { useAtom } from 'jotai'

import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { DbDump } from './DbDump.tsx'
import {
  breadcrumbsOverflowingAtom,
  navsOverflowingAtom,
  enforceMobileNavigationAtom,
  enforceDesktopNavigationAtom,
  alwaysShowTreeAtom,
} from '../../store.ts'

import '../../form.css'

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

  const [enforceMobileNavigation, setEnforceMobileNavigation] = useAtom(
    enforceMobileNavigationAtom,
  )
  const toggleEnforceMobileNavigation = useCallback(
    () => setEnforceMobileNavigation(!enforceMobileNavigation),
    [enforceMobileNavigation, setEnforceMobileNavigation],
  )

  const [enforceDesktopNavigation, setEnforceDesktopNavigation] = useAtom(
    enforceDesktopNavigationAtom,
  )
  const toggleEnforceDesktopNavigation = useCallback(
    () => setEnforceDesktopNavigation(!enforceDesktopNavigation),
    [enforceDesktopNavigation, setEnforceDesktopNavigation],
  )

  const [alwaysShowTree, setAlwaysShowTree] = useAtom(alwaysShowTreeAtom)
  const toggleAlwaysShowTree = useCallback(
    () => setAlwaysShowTree(!alwaysShowTree),
    [alwaysShowTree, setAlwaysShowTree],
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
        <SwitchField
          label="Enforce mobile navigation"
          value={enforceMobileNavigation}
          onChange={toggleEnforceMobileNavigation}
          validationMessage="If true, mobile navigation will be enforced"
        />
        <SwitchField
          label="Enforce desktop navigation"
          value={enforceDesktopNavigation}
          onChange={toggleEnforceDesktopNavigation}
          validationMessage="If true, desktop navigation will be enforced"
        />
        <SwitchField
          label="Always show tree"
          value={alwaysShowTree}
          onChange={toggleAlwaysShowTree}
          validationMessage="If true, the tree will always be shown"
        />
        <DbDump />
      </div>
    </div>
  )
})
