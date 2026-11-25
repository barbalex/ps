import { LatLng } from 'leaflet'

export const GPS_FIX_COUNT = 5

export const averageGpsFixes = (
  fixes: { position: LatLng; accuracy: number }[],
) => {
  const rad = Math.PI / 180
  let x = 0
  let y = 0
  let z = 0
  for (const {
    position: { lat, lng },
  } of fixes) {
    x += Math.cos(lat * rad) * Math.cos(lng * rad)
    y += Math.cos(lat * rad) * Math.sin(lng * rad)
    z += Math.sin(lat * rad)
  }
  const position = new LatLng(
    Math.atan2(z, Math.hypot(x, y)) / rad,
    Math.atan2(y, x) / rad,
  )
  // Repeated device errors can be correlated. Cover the individual accuracy
  // circles rather than claiming a statistical gain from five readings.
  const accuracy = Math.max(
    ...fixes.map((fix) => position.distanceTo(fix.position) + fix.accuracy),
  )
  return { position, accuracy }
}
