import proj4 from 'proj4'

export const epsgTo4326 = ({ x, y, projectMapPresentationCrs }) => {
  if (!projectMapPresentationCrs || projectMapPresentationCrs === 'EPSG:4326') {
    return [x, y].reverse()
  }
  // no idea why but values have to be reversed
  // also: make sure to pass in numbers, not strings
  return proj4(projectMapPresentationCrs, 'EPSG:4326', [+x, +y]).reverse()
}
