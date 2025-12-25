import { useState, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { pipe } from 'remeda'

import { on } from '../../../../../css.ts'
import { epsgTo4326 } from '../../../../../modules/epsgTo4326.ts'
import styles from './Inputs.module.css'

export const Inputs = ({
  coordinates: coordsIn,
  projectMapPresentationCrs,
}) => {
  const map = useMap()

  const [coordinates, setCoordinates] = useState(coordsIn)
  // update coordinates when coordsIn changes
  useEffect(() => {
    setCoordinates(coordsIn)
  }, [coordsIn])

  const onChange = (e) => {
    const name = e.target.name
    const value = parseFloat(e.target.value)
    const newCoordinates = { ...coordinates, [name]: value }
    setCoordinates(newCoordinates)
  }

  const onBlur = () => {
    const [x, y] = epsgTo4326({
      x: coordinates.x,
      y: coordinates.y,
      projectMapPresentationCrs,
    })
    map.setView([x, y])
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      onBlur()
      // unfocus input
      e.target.blur()
    }
  }

  return (
    <div className={styles.container}>
      <input
        type="text"
        name="x"
        value={coordinates?.x ?? '...'}
        className={`${styles.input} ${styles.alignRight}`}
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      {`/`}
      <input
        type="text"
        name="y"
        value={coordinates?.y ?? '...'}
        className={`${styles.input} ${styles.alignLeft}`}
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
