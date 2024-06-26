import proj4 from 'proj4'

const round = (num) => {
  const integerLength = Math.floor(num).toString().length
  if (integerLength > 6) {
    // if > 6 places before the comma: return as integer
    return parseInt(num, 10)
  }
  // round to 7 decimal places
  return Math.round(num * 10000000) / 10000000
}

// proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs')

export const epsgFrom4326 = async ({
  x: xPassed,
  y: yPassed,
  project_id = '99999999-9999-9999-9999-999999999999',
  db,
}) => {
  console.log('epsgFrom4326', {
    xPassed,
    yPassed,
    project_id,
  })
  // 1. get project.map_presentation_crs
  const project = await db.projects.findUnique({
    where: { project_id },
    select: { map_presentation_crs: true },
  })
  console.log('epsgFrom4326, project:', project)
  const mapPresentationCrsCode = project.map_presentation_crs
  console.log('epsgFrom4326, crsCode:', {
    crsCode: mapPresentationCrsCode,
    project,
  })
  if (!mapPresentationCrsCode) {
    return [round(xPassed), round(yPassed)]
  }
  // 2. get crs.proj4
  const crs = await db.crs.findFirst({
    where: { code: mapPresentationCrsCode },
  })
  crs.code && crs.proj4 && proj4.defs(crs.code, crs.proj4)

  const [x, y] = proj4('EPSG:4326', mapPresentationCrsCode, [
    +xPassed,
    +yPassed,
  ])
  // round to the integer if > 6 decimal places before the comma

  return [round(x), round(y)]
}
