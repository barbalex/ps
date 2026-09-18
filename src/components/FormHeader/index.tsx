import type { ReactNode } from 'react'

import { FormMenu } from '../FormMenu/index.tsx'
import { SectionDescription } from '../shared/SectionDescription.tsx'
import styles from './index.module.css'

interface Props {
  title?: ReactNode
  description?: ReactNode
  addRow?: () => void
  addRowDisabled?: boolean
  addRowDisabledReason?: string
  deleteRow?: () => void
  toNext?: () => void
  toPrevious?: () => void
  toNextDisabled?: boolean
  toPreviousDisabled?: boolean
  tableName?: string
  siblings?: ReactNode
}

export const FormHeader = ({
  title,
  description,
  addRow,
  addRowDisabled,
  addRowDisabledReason,
  deleteRow,
  toNext,
  toPrevious,
  toNextDisabled,
  toPreviousDisabled,
  tableName,
  siblings,
}: Props) => (
  <>
    <div className="form-header">
      <h1 className={styles.title}>{title}</h1>
      {(addRow || deleteRow || toNext || toPrevious || siblings) && (
        <FormMenu
          addRow={addRow}
          addRowDisabled={addRowDisabled}
          addRowDisabledReason={addRowDisabledReason}
          deleteRow={deleteRow}
          toNext={toNext}
          toPrevious={toPrevious}
          toNextDisabled={toNextDisabled}
          toPreviousDisabled={toPreviousDisabled}
          nameSingular={tableName}
          siblings={siblings}
        />
      )}
    </div>
    {!!description && (
      <div className={styles.descriptionWrapper}>
        <SectionDescription>{description}</SectionDescription>
      </div>
    )}
  </>
)
