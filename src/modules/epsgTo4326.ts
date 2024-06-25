import proj4 from 'proj4'
proj4.defs(
  'EPSG:2056',
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
)
proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs')

export const epsgTo4326 = ({ x, y, project_id, db }) => {
  // 1. get project.map_presentation_crs
  const project = db.projects.findUnique({
    where: { id: project_id },
    select: { map_presentation_crs: true },
  })
  const crsCode = project.map_presentation_crs
  // 2. get crs.proj4
  const crs = db.crs.findFirst({
    where: { code: crsCode },
    select: { proj4: true },
  })
  // no idea why but values have to be reversed
  // also: make sure to pass in numbers, not strings
  return proj4(crsCode, 'EPSG:4326', [+x, +y]).reverse()
}
