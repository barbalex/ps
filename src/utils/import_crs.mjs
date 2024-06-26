// this script is used to import the crs from spatialreference.org and epsg.io and save it to a json file
// using https://spatialreference.org/crslist.json as crs-orig.json
import * as fs from 'fs'
const crsArray = JSON.parse(fs.readFileSync('crs-orig.json', 'utf8'))
// loop all crsArray and delete the unwanted fields

// TODO: crslist.json contains loads of duplicate values :-(
// remove all values where auth_name combined with code is not unique
const crsArrayUnique = crsArray.filter(
  (crs, index, self) =>
    self.findIndex(
      (t) => t.auth_name === crs.auth_name && t.code === crs.code,
    ) === index,
)

for await (const crs of crsArrayUnique) {
  let proj4Resp
  try {
    proj4Resp = await fetch(`https://epsg.io/${crs.code}.proj4`)
    crs.proj4 = await proj4Resp.text()
    if (!proj4Resp.ok) {
      crs.proj4 = null
    }
  } catch (error) {
    crs.proj4 = null
  }
  // //epsg.io/2056.wkt
  // not needed as nearly all have proj4, many more miss wkt
  // let wktResp
  // try {
  //   wktResp = await fetch(`https://epsg.io/${crs.code}.wkt`)
  //   crs.wkt = await wktResp.text()
  //   if (!wktResp.ok) {
  //     crs.wkt = null
  //   }
  // } catch (error) {
  //   crs.wkt = null
  // }
  crs.code = `${crs.auth_name}:${crs.code}`
  delete crs.auth_name
  delete crs.type
  delete crs.deprecated
  delete crs.area_of_use
  delete crs.projection_method_name
  console.log(crs.code)
}

// write the new crsArray to a new file
fs.writeFileSync('crs-new.json', JSON.stringify(crsArray, null, 2), 'utf8')
console.log('done')
