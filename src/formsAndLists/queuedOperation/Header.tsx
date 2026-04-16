import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { FaMinus, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { operationsQueueAtom, removeOperationAtom } from '../../store.ts'
import { revertOperation } from '../../modules/revertOperation.ts'

const from = '/data/queued-operations/$queuedOperationId'

export const Header = () => {
  const { formatMessage } = useIntl()
  const { queuedOperationId } = useParams({ from })
  const navigate = useNavigate()
  const operationsQueue = useAtomValue(operationsQueueAtom)
  const removeOperation = useSetAtom(removeOperationAtom)

  const qo = operationsQueue.find((o) => o.id === queuedOperationId)
  const index = operationsQueue.findIndex((o) => o.id === queuedOperationId)
  const canNavigate = operationsQueue.length > 1

  const onClickRevert = async () => {
    if (!qo) return
    await revertOperation(qo)
    removeOperation(queuedOperationId)
    navigate({ to: '/data/queued-operations' })
  }

  const onClickPrevious = () => {
    const prev =
      operationsQueue[
        (index - 1 + operationsQueue.length) % operationsQueue.length
      ]
    navigate({ to: `/data/queued-operations/${prev.id}` })
  }

  const onClickNext = () => {
    const next = operationsQueue[(index + 1) % operationsQueue.length]
    navigate({ to: `/data/queued-operations/${next.id}` })
  }

  const navButtons = (
    <>
      {canNavigate && (
        <Tooltip
          content={formatMessage({ id: 'Wn2kTv', defaultMessage: 'vorherig' })}
        >
          <Button
            size="medium"
            icon={<FaChevronLeft />}
            onClick={onClickPrevious}
          />
        </Tooltip>
      )}
      <Tooltip
        content={formatMessage({
          id: 'qoRevertBtn',
          defaultMessage: 'widerrufen',
        })}
      >
        <Button
          size="medium"
          icon={<FaMinus />}
          onClick={onClickRevert}
          aria-label={formatMessage({
            id: 'qoRevertBtn',
            defaultMessage: 'widerrufen',
          })}
        />
      </Tooltip>
      {canNavigate && (
        <Tooltip
          content={formatMessage({ id: 'Xm4pLq', defaultMessage: 'nächst' })}
        >
          <Button
            size="medium"
            icon={<FaChevronRight />}
            onClick={onClickNext}
          />
        </Tooltip>
      )}
    </>
  )

  return (
    <FormHeader
      title={formatMessage({
        id: 'qo.nameSingular',
        defaultMessage: 'Ausstehende Operation',
      })}
      tableName={formatMessage({
        id: 'qo.nameSingular',
        defaultMessage: 'Ausstehende Operation',
      })}
      siblings={navButtons}
    />
  )
}
