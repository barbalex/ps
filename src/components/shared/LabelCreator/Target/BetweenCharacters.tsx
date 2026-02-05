import { Input } from '@fluentui/react-components'

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
      style={{
        ...provided.draggableProps.style,
        position: 'relative',
      }}
      className={snapshot.isDragging ? styles.containerDragging : styles.container}
    >
      <Input
        label="Separator (any Text)"
        placeholder="Enter any text"
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
