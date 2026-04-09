import { FaPlus, FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip } = fluentUiReactComponents
import { useIntl } from 'react-intl'

import { Delete } from './Delete.tsx'
import { MenuBar } from '../MenuBar/index.tsx'

export const FormMenu = ({
  addRow,
  addRowDisabled = false,
  addRowDisabledReason,
  deleteRow,
  deleteRowDisabled = false,
  deleteLabel = null,
  deleteConfirmLabel = null,
  toNext,
  toPrevious,
  toNextDisabled = false,
  toPreviousDisabled = false,
  tableName = '',
  siblings,
}) => {
  const { formatMessage } = useIntl()

  return (
    <MenuBar collapseOffset={10}>
      {!!siblings && siblings}
      {!!toPrevious && (
        <Tooltip
          content={formatMessage({ id: 'Wn2kTv', defaultMessage: 'vorherig' })}
        >
          <Button
            size="medium"
            icon={<FaChevronLeft />}
            onClick={toPrevious}
            disabled={toPreviousDisabled}
          />
        </Tooltip>
      )}
      {!!addRow && (
        <Tooltip
          content={
            addRowDisabled && addRowDisabledReason
              ? addRowDisabledReason
              : formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })
          }
        >
          <Button
            size="medium"
            icon={<FaPlus />}
            onClick={addRow}
            disabled={addRowDisabled}
          />
        </Tooltip>
      )}
      {!!deleteRow && (
        <Delete
          deleteRow={deleteRow}
          tableName={tableName}
          deleteLabel={deleteLabel}
          deleteConfirmLabel={deleteConfirmLabel}
          disabled={deleteRowDisabled}
        />
      )}
      {!!toNext && (
        <Tooltip
          content={formatMessage({
            id: 'Xm4pLq',
            defaultMessage: 'n\u00e4chst',
          })}
        >
          <Button
            size="medium"
            icon={<FaChevronRight />}
            onClick={toNext}
            disabled={toNextDisabled}
          />
        </Tooltip>
      )}
    </MenuBar>
  )
}
