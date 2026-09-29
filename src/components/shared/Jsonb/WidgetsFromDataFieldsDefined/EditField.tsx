import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { MdEdit } from 'react-icons/md'
import { useAtom } from 'jotai'
import { useNavigate, useLocation, useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { designingAtom } from '../../../../store.ts'

export const EditField = ({ fieldId }: { fieldId: string }) => {
  const { projectId } = useParams({ strict: false })
  const [designingMap] = useAtom(designingAtom)
  const designing = designingMap[projectId ?? ''] ?? false
  const navigate = useNavigate()
  const location = useLocation()
  const { formatMessage } = useIntl()

  const onClick = () => navigate({ search: { editingField: fieldId } as never })

  if (!designing) return null
  if (location.pathname.endsWith('filter')) return null

  return (
    <Button
      size="medium"
      icon={<MdEdit />}
      onClick={onClick}
      title={formatMessage({ id: '72yYP5', defaultMessage: 'Feld bearbeiten' })}
    />
  )
}
