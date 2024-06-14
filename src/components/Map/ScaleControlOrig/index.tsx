// https://github.com/Flexberry/leaflet-switch-scale-control
// but due to semantic ui requirement using this instead:
// https://github.com/victorzinho/leaflet-switch-scale-control
import 'leaflet'
import { SwitchScaleControl } from './SwitchScaleControl.ts'
// import SwitchScaleControl from 'leaflet-switch-scale-control'
import { createControlComponent } from '@react-leaflet/core'
import './styles.css'

export const ScaleControl = createControlComponent(
  () => new SwitchScaleControl(),
)
