import { TileLayer } from 'react-leaflet'

export const OsmColor = () => (
  <TileLayer
    // url="//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="//osm.org/copyright">OpenStreetMap</a>'
    // maxNativeZoom={19}
    // minZoom={0}
    // maxZoom={22}
  />
)
