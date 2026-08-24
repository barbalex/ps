import { useRef, useEffect } from 'react'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import { BsArrowsMove } from 'react-icons/bs'
import { useIntl } from 'react-intl'

import { labelCreatorItemKey } from './dnd.ts'
import styles from './FieldList.module.css'

// only show fields not yet added to label
interface FieldListProps {
  fieldLabels: { type: 'field'; value: string; id: string }[]
  instanceId: symbol
}

export const FieldList = ({ fieldLabels, instanceId }: FieldListProps) => {
  const { formatMessage } = useIntl()
  const fieldsListRef = useRef<HTMLDivElement>(null)
  const separatorRef = useRef<HTMLDivElement>(null)
  const fieldRefs = useRef(new Map<string, HTMLDivElement>())

  // keep the field list scrollable while dragging
  useEffect(() => {
    const element = fieldsListRef.current
    if (!element) return
    return autoScrollForElements({
      element,
    })
  }, [])

  useEffect(() => {
    const cleanups: (() => void)[] = []

    fieldRefs.current.forEach((element, id) => {
      cleanups.push(
        draggable({
          element,
          getInitialData: () => ({
            [labelCreatorItemKey]: true,
            instanceId,
            kind: 'field',
            id,
          }),
        }),
      )
    })

    const separatorElement = separatorRef.current
    if (separatorElement) {
      cleanups.push(
        draggable({
          element: separatorElement,
          getInitialData: () => ({
            [labelCreatorItemKey]: true,
            instanceId,
            kind: 'separator',
          }),
        }),
      )
    }

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [fieldLabels, instanceId])

  return (
    <div className={styles.container}>
      <div className={styles.fieldList}>
        <h5 className={styles.title}>
          {formatMessage({ id: 'fLdTtl', defaultMessage: 'Felder' })}{' '}
          <span className={styles.titleSpan}>({fieldLabels.length})</span>
        </h5>
        <div className={styles.fieldsList} ref={fieldsListRef}>
          {(fieldLabels ?? []).map((fieldLabel) => (
            <div
              key={fieldLabel.id}
              ref={(element) => {
                if (element) {
                  fieldRefs.current.set(fieldLabel.id, element)
                } else {
                  fieldRefs.current.delete(fieldLabel.id)
                }
              }}
              className={styles.fieldContainer}
            >
              {fieldLabel.value}
              <BsArrowsMove className={styles.fieldHandle} />
            </div>
          ))}
        </div>
        <h5 className={styles.title}>
          {formatMessage({
            id: 'fLdSep',
            defaultMessage: 'Trenntext / Zeichen',
          })}
        </h5>
        <div ref={separatorRef} className={styles.dividerContainer}>
          {formatMessage({
            id: 'fLdAny',
            defaultMessage: 'Beliebiger Text',
          })}
          <BsArrowsMove className={styles.fieldHandle} />
        </div>
      </div>
    </div>
  )
}
