import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { MdMenuBook } from 'react-icons/md'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents

import { ListHeader } from '../../components/ListHeader.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { useQueuedOperationsNavData } from '../../modules/useQueuedOperationsNavData.ts'
import { constants } from '../../modules/constants.ts'
import { operationsQueueAtom, removeOperationAtom } from '../../store.ts'
import { revertOperation } from '../../modules/revertOperation.ts'

import '../../form.css'

export const QueuedOperationsList = () => {
  const { formatMessage } = useIntl()
  const operationsQueue = useAtomValue(operationsQueueAtom)
  const removeOperation = useSetAtom(removeOperationAtom)

  const { navData } = useQueuedOperationsNavData()
  const { label, nameSingular, navs } = navData

  const openDocs = () => {
    const url = `${constants?.getAppUri()}/docs/offline`
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return window.open(url, '_blank', 'toolbar=no')
    }
    window.open(url)
  }

  const revertAll = async () => {
    for (const qo of operationsQueue) {
      await revertOperation(qo)
      removeOperation(qo.id)
    }
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        deleteRow={operationsQueue.length ? revertAll : undefined}
        deleteLabel={formatMessage({
          id: 'qo.revertAll',
          defaultMessage: 'alle widerrufen',
        })}
        deleteConfirmLabel={formatMessage({
          id: 'qo.revertAllConfirm',
          defaultMessage: 'Alle ausstehenden Operationen widerrufen?',
        })}
        menus={
          <Button
            icon={<MdMenuBook />}
            onClick={openDocs}
            title={formatMessage({
              id: 'qc.openDocs',
              defaultMessage: 'Dokumentation öffnen',
            })}
            aria-label={formatMessage({
              id: 'qc.openDocs',
              defaultMessage: 'Dokumentation öffnen',
            })}
          />
        }
      />
      <div className="list-container">
        {navs.length === 0 && (
          <div style={{ padding: '0 15px' }}>
            {formatMessage({
              id: 'qoNoPendingOps',
              defaultMessage: 'Momentan gibt es keine ausstehenden Operationen',
            })}
          </div>
        )}
        {navs.map(({ id, label }) => (
          <Row key={id} label={label} to={id} />
        ))}
      </div>
    </div>
  )
}
