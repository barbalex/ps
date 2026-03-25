import { createContext } from 'react'

/**
 * True when a component is rendered inside the QcsResultDialog's embedded
 * memory router. Layout shell components (AuthAndDb, etc.) check this and
 * render <Outlet /> only, so the dialog shows just the matched form or list
 * without the full application chrome.
 */
export const DialogModeContext = createContext(false)
