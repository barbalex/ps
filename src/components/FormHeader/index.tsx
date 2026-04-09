import { FormMenu } from '../FormMenu/index.tsx'
import { SectionDescription } from '../shared/SectionDescription.tsx'
import styles from './index.module.css'

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
}) => (
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
