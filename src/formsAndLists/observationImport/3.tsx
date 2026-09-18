import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'

import { LabelCreator } from '../../components/shared/LabelCreator/index.tsx'
import type { LabelElement } from '../../components/shared/LabelCreator/index.tsx'
import { setLabels } from './3/setLabels.ts'
import { formatNumber } from '../../modules/formatNumber.ts'
import type ObservationImports from '../../models/public/ObservationImports.ts'

type InputOnChangeData = Parameters<
  NonNullable<
    React.ComponentProps<typeof fluentUiReactComponents.Input>['onChange']
  >
>[1]

export const Three = ({
  observationImport,
  observationFields,
  onChange,
}: {
  observationImport: ObservationImports
  observationFields: string[]
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => Promise<void>
  validations?: Record<string, { state: 'error'; message: string }>
}) => {
  const { formatMessage } = useIntl()
  const res = useLiveQuery(
    `SELECT COUNT(*) as count FROM observations WHERE observation_import_id = $1`,
    [observationImport?.observation_import_id],
  )
  const observationCount = (res?.rows?.[0]?.count ?? 0) as number

  const onApply = async (labelCreation: LabelElement[]) => {
    await setLabels({
      labelCreation,
      observationImportId: observationImport.observation_import_id,
    })
  }

  const buttonLabel =
    observationCount > 0
      ? formatMessage({ id: 'lBlSet', defaultMessage: '{count} Beobachtungen beschriften' }, { count: formatNumber(observationCount) as string })
      : formatMessage({ id: 'lBlApl', defaultMessage: 'Änderungen anwenden' })

  return (
    <LabelCreator
      label={observationImport.label_creation as LabelElement[]}
      fields={observationFields}
      name="label_creation"
      onChange={
        onChange as unknown as (event: {
          target: { value: LabelElement[] | null; name: string }
        }) => void
      }
      buttonLabel={buttonLabel}
      onApply={onApply}
    />
  )
}
