import type { ComponentProps, FC, ReactNode } from 'react'
import { FaPlus, FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Tooltip: TooltipComponent } = fluentUiReactComponents
import { useIntl } from 'react-intl'

import { Delete } from './Delete.tsx'
import { MenuBar as MenuBarComponent } from '../MenuBar/index.tsx'

// Fluent's Tooltip types require a `relationship` prop that is not passed here
const Tooltip = TooltipComponent as FC<
  Partial<ComponentProps<typeof TooltipComponent>>
>
// MenuBar's props are still untyped upstream
const MenuBar = MenuBarComponent as FC<
  Partial<ComponentProps<typeof MenuBarComponent>>
>

interface Props {
  addRow?: () => void
  addRowDisabled?: boolean
  addRowDisabledReason?: string
  deleteRow?: () => void
  deleteRowDisabled?: boolean
  deleteLabel?: string | null
  deleteConfirmLabel?: string | null
  toNext?: () => void
  toPrevious?: () => void
  toNextDisabled?: boolean
  toPreviousDisabled?: boolean
  tableName?: string
  /** accepted for compatibility, not used by FormMenu itself */
  nameSingular?: string
  siblings?: ReactNode
}

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
}: Props) => {
  const { formatMessage } = useIntl()

  return (
    <MenuBar collapseOffset={20}>
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
