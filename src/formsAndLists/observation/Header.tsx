import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'

export const Header = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, observationId } =
    useParams({ from })
  const navigate = useNavigate()
  const { formatMessage } = useIntl()
  const base = `/data/projects/${projectId}/subprojects/${subprojectId}`
  const basePath = from.includes('observations-to-assess')
    ? `${base}/observations-to-assess/${observationId}`
    : from.includes('observations-not-to-assign')
      ? `${base}/observations-not-to-assign/${observationId}`
      : placeId2
        ? `${base}/places/${placeId}/places/${placeId2}/observations/${observationId}`
        : `${base}/places/${placeId}/observations/${observationId}`

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
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="observations_history"
          rowIdField="observation_id"
          rowId={observationId}
        />
      }
    />
  )
}
