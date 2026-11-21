// A capabilities fetch inserts every layer of a service with fresh uuids.
// Two fetchers can observe the same service with zero layers while the other
// one's network request is still in flight: the manual fetch button
// (FetchWmsCapabilities / FetchWfsCapabilities) and the layout-wide
// AutoFetchCapabilities, which picks up the service row the moment it is
// created. Both would then insert the full layer list — every layer twice.
// This registry serializes fetches per service: the second caller returns
// early and lets the first populate the layers.
const inFlight = new Set<string>()

/** claims the key; false when another fetch already holds it */
export const beginCapabilitiesFetch = (key: string) => {
  if (inFlight.has(key)) return false
  inFlight.add(key)
  return true
}

export const endCapabilitiesFetch = (key: string) => {
  inFlight.delete(key)
}
