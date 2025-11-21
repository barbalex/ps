import { useAtom } from 'jotai'

import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { DbDump } from './DbDump.tsx'
import {
  enforceMobileNavigationAtom,
  enforceDesktopNavigationAtom,
  alwaysShowTreeAtom,
} from '../../store.ts'

import '../../form.css'

export const AppStates = () => {
  const [enforceMobileNavigation, setEnforceMobileNavigation] = useAtom(
    enforceMobileNavigationAtom,
  )
  const toggleEnforceMobileNavigation = () =>
    setEnforceMobileNavigation(!enforceMobileNavigation)

  const [enforceDesktopNavigation, setEnforceDesktopNavigation] = useAtom(
    enforceDesktopNavigationAtom,
  )
  const toggleEnforceDesktopNavigation = () =>
    setEnforceDesktopNavigation(!enforceDesktopNavigation)

  const [alwaysShowTree, setAlwaysShowTree] = useAtom(alwaysShowTreeAtom)
  const toggleAlwaysShowTree = () => setAlwaysShowTree(!alwaysShowTree)

  return (
    <div className="form-outer-container">
      <FormHeader title="Options" />
      <div className="form-container">
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
}
