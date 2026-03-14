import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { LabelCreator } from '../../components/shared/LabelCreator/index.tsx'
import { setLabels } from './3/setLabels.ts'
import { formatNumber } from '../../modules/formatNumber.ts'

export const Three = ({ observationImport, observationFields, onChange }) => {
  const { formatMessage } = useIntl()
  const res = useLiveQuery(
    `SELECT COUNT(*) as count FROM observations WHERE observation_import_id = $1`,
    [observationImport?.observation_import_id],
  )
  const observationCount = res?.rows?.[0]?.count ?? 0

  const onApply = async (labelCreation) => {
    await setLabels({
      labelCreation,
      observationImportId: observationImport.observation_import_id,
    })
  }

  const buttonLabel =
    observationCount > 0
      ? formatMessage({ id: 'lBlSet', defaultMessage: '{count} Beobachtungen beschriften' }, { count: formatNumber(observationCount) })
      : formatMessage({ id: 'lBlApl', defaultMessage: 'Änderungen anwenden' })

  return (
    <LabelCreator
      label={observationImport.label_creation}
      fields={observationFields}
      name="label_creation"
      onChange={onChange}
      buttonLabel={buttonLabel}
      onApply={onApply}
    />
  )
}
