import { useState, useEffect } from 'react'
import { useMap } from 'react-leaflet'

import { epsgTo4326 } from '../../../../../modules/epsgTo4326.ts'
import { formatCoordinate } from '../../../../../modules/roundCoordinates.ts'
import styles from './Inputs.module.css'

type Props = {
  coordinates: { x?: number | null; y?: number | null }
  projectMapPresentationCrs?: string | null
}

export const Inputs = ({
  coordinates: coordsIn,
  projectMapPresentationCrs,
}: Props) => {
  const map = useMap()

  const [coordinates, setCoordinates] = useState(coordsIn)
  const [focused, setFocused] = useState<'x' | 'y' | null>(null)
  // update coordinates when coordsIn changes
  useEffect(() => {
    setCoordinates(coordsIn)
  }, [coordsIn])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name
    const value = parseFloat(e.target.value)
    const newCoordinates = { ...coordinates, [name]: value }
    setCoordinates(newCoordinates)
  }

  const onBlur = () => {
    setFocused(null)
    const [x, y] = epsgTo4326({
      x: coordinates.x,
      y: coordinates.y,
      projectMapPresentationCrs,
    })
    map.setView([x!, y!])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onBlur()
      // unfocus input
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div className={styles.container}>
      <input
        type="text"
        name="x"
        value={focused === 'x' ? (coordinates?.x ?? '') : (formatCoordinate(coordinates?.x) ?? '...')}
        className={`${styles.input} ${styles.alignRight}`}
        onFocus={() => setFocused('x')}
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      {`/`}
      <input
        type="text"
        name="y"
        value={focused === 'y' ? (coordinates?.y ?? '') : (formatCoordinate(coordinates?.y) ?? '...')}
        className={`${styles.input} ${styles.alignLeft}`}
        onFocus={() => setFocused('y')}
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
