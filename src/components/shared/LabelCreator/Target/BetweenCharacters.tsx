import * as fluentUiReactComponents from '@fluentui/react-components'
const { Input } = fluentUiReactComponents
import { useIntl } from 'react-intl'

import { TargetElement } from './TargetElements.tsx'
import { LabelElement } from '../index.tsx'
import styles from './BetweenCharacters.module.css'

interface Props {
  el: TargetElement
  label: LabelElement[]
  name: string
  onChange: () => void
  index: number
  children: React.ReactNode
}

export const BetweenCharacters = ({
  el,
  label,
  onChange,
  index,
  children,
  snapshot,
  provided,
}: Props) => {
  const { formatMessage } = useIntl()

  const onBlur = (event) => {
    const newLabel = [...label]
    newLabel.forEach((labelElement, i) => {
      if (i === index) {
        labelElement.value = event.target.value
      }
    })
    onChange(newLabel)
  }

  return (
    <div
      style={provided.draggableProps.style}
      className={
        snapshot.isDragging ? styles.containerDragging : styles.container
      }
    >
      <Input
        label={formatMessage({
          id: 'bChrSp',
          defaultMessage: 'Trennzeichen (beliebiger Text)',
        })}
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
