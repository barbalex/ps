import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = ({ from }) => {
  const { observationId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  const db = usePGlite()

  // Keep a ref to the current observationId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const observationIdRef = useRef(observationId)
  useEffect(() => {
    observationIdRef.current = observationId
  }, [observationId])

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT observation_id FROM observations WHERE place_id = $1 ORDER BY label',
        [placeId2 ?? placeId],
      )
      const observations = res?.rows
      const len = observations.length
      const index = observations.findIndex(
        (p) => p.observation_id === observationIdRef.current,
      )
      const next = observations[(index + 1) % len]
      navigate({
        to: `../${next.observation_id}`,
        params: (prev) => ({ ...prev, observationId: next.observation_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT observation_id FROM observations WHERE place_id = $1 ORDER BY label',
        [placeId2 ?? placeId],
      )
      const observations = res?.rows
      const len = observations.length
      const index = observations.findIndex(
        (p) => p.observation_id === observationIdRef.current,
      )
      const previous = observations[(index + len - 1) % len]
      navigate({
        to: `../${previous.observation_id}`,
        params: (prev) => ({ ...prev, observationId: previous.observation_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({ id: 'obs0Hdr', defaultMessage: 'Beobachtung' })}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="observation"
    />
  )
}
