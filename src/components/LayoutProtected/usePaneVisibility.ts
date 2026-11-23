import { useAtomValue } from 'jotai'

import {
  enforceMobileNavigationAtom,
  effectiveTabsOf,
  isMobileViewAtom,
  mapMaximizedAtom,
} from '../../store.ts'
import { useUrlPanes } from '../../modules/useUrlPanes.ts'

// Which layout panes (tree / data / map) currently render. Shared by Main
// (rendering the panes) and LayoutProtected (hiding the breadcrumbs when
// neither tree nor data is visible — with only the map on screen they have
// nothing to navigate, and on mobile they waste precious vertical space)
export const usePaneVisibility = () => {
  const mapMaximized = useAtomValue(mapMaximizedAtom)
  const isMobileView = useAtomValue(isMobileViewAtom)
  const enforceMobileNavigation = useAtomValue(enforceMobileNavigationAtom)
  // url panes win, the tabsAtom is the fallback (see the hook);
  // effectiveTabsOf applies the mobile single-tab rule at read time, so on
  // mobile only the preferred pane (data > map > tree) renders from the very
  // first render — no stale tree pane while the panes state catches up
  const [panes] = useUrlPanes()
  const tabs = effectiveTabsOf(panes, isMobileView, enforceMobileNavigation)

  const mapMaximizedAndVisible = (mapMaximized && tabs.includes('map')) ?? false

  const treeVisible = !mapMaximizedAndVisible && tabs.includes('tree')
  const dataVisible = !mapMaximizedAndVisible && tabs.includes('data')
  const mapVisible = tabs.includes('map')
  return { treeVisible, dataVisible, mapVisible }
}
