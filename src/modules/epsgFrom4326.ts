import proj4 from 'proj4'

export const epsgFrom4326 = ({
  x: xPassed,
  y: yPassed,
  projectMapPresentationCrs,
  crs,
}) => {
  if (!projectMapPresentationCrs || projectMapPresentationCrs === 'EPSG:4326') {
    return [xPassed, yPassed]
  }
  if (!crs || !crs.code || !crs.proj4) {
    return [xPassed, yPassed]
  }
  crs.code && crs.proj4 && proj4.defs(crs.code, crs.proj4)

  const [x, y] = proj4('EPSG:4326', projectMapPresentationCrs, [
    +xPassed,
    +yPassed,
  ])

  return [x, y]
}
