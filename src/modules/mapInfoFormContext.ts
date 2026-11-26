import { createContext, useContext } from 'react'

// Only the map-only Info outlet provides a root. Ancestor route layouts
// outside the selected object must still pass through to that outlet.
export const MapInfoFormRoot = createContext<string | undefined>(undefined)

export const useMapInfoForm = (path?: string) => {
  const root = useContext(MapInfoFormRoot)
  return !!root && (!path || path === root || path.startsWith(`${root}/`))
}
