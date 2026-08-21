import * as fluentUiReactComponents from '@fluentui/react-components'
const { Input } = fluentUiReactComponents
import { useIntl } from 'react-intl'

import { LabelElement } from '../index.tsx'
import styles from './BetweenCharacters.module.css'

interface Props {
  el: { type: 'field' | 'separator'; value: string; id?: string }
  label: ({ type: 'field' | 'separator'; value: string; id?: string })[] | null
  name?: string
  onChange: (newLabel: LabelElement[] | null) => void
  index: number
  isDragging: boolean
  children: React.ReactNode
}

export const BetweenCharacters = ({
  el,
  label,
  onChange,
  index,
  isDragging,
  children,
}: Props) => {
  const { formatMessage } = useIntl()

  const onBlur: fluentUiReactComponents.InputProps['onChange'] = (
    _ev,
    data,
  ) => {
    const newLabel = [...(label ?? [])]
    newLabel.forEach((labelElement, i) => {
      if (i === index) {
        labelElement.value = data.value
      }
    })
    onChange(newLabel)
  }

  return (
    <div
      className={isDragging ? styles.containerDragging : styles.container}
    >
      <Input
        placeholder={formatMessage({
          id: 'bChrPh',
          defaultMessage: 'Beliebigen Text eingeben',
        })}
        defaultValue={el.value ?? ''}
        appearance="outline"
        size="small"
        onChange={onBlur}
        className={styles.input}
        autoFocus
      />
      {children}
    </div>
  )
}
