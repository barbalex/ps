import proj4 from 'proj4'

const round = (num) => Math.round(num * 10000000) / 10000000

// proj4.defs(
//   'EPSG:2056',
//   '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
// )
// TODO: is this needed?
proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs')

export const epsgFrom4326 = async ({
  x: xPassed,
  y: yPassed,
  project_id,
  db,
}) => {
  // 1. get project.map_presentation_crs
  const project = await db.projects.findUnique({
    where: { id: project_id },
    // select: { map_presentation_crs: true },
  })
  const crsCode = project.map_presentation_crs
  console.log('epsgFrom4326, crsCode:', { crsCode, project })
  if (!crsCode) {
    return [round(xPassed), round(yPassed)]
  }
  // 2. get crs.proj4
  const crs = await db.crs.findFirst({
    where: { code: crsCode },
    select: { proj4: true },
  })

  proj4.defs(crs.code, crs.proj4)

  const [x, y] = proj4('EPSG:4326', crsCode, [+xPassed, +yPassed])
  // round to the integer
  return [parseInt(x, 10), parseInt(y, 10)]
}
