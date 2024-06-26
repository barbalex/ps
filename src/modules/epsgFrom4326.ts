import proj4 from 'proj4'

export const epsgFrom4326 = async ({
  x: xPassed,
  y: yPassed,
  project_id = '99999999-9999-9999-9999-999999999999',
  db,
}) => {
  // 1. get project.map_presentation_crs
  const project = await db.projects.findUnique({
    where: { project_id },
    select: { map_presentation_crs: true },
  })
  const mPCrsCode = project.map_presentation_crs
  if (!mPCrsCode || mPCrsCode === 'EPSG:4326') {
    return [xPassed, yPassed]
  }
  // 2. get crs.proj4
  const crs = await db.crs.findFirst({
    where: { code: mPCrsCode },
  })
  crs.code && crs.proj4 && proj4.defs(crs.code, crs.proj4)

  const [x, y] = proj4('EPSG:4326', mPCrsCode, [+xPassed, +yPassed])

  return [x, y]
}
