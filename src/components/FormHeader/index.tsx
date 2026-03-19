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
  // needed to leave space for the map layer drawer's close button
  titleMarginLeft,
}) => (
  <>
    <div className="form-header">
      <h1
        className={styles.title}
        style={titleMarginLeft ? { marginLeft: titleMarginLeft } : {}}
      >
        {title}
      </h1>
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
      <div style={{ padding: '10px 10px 0 10px' }}>
        <SectionDescription>{description}</SectionDescription>
      </div>
    )}
  </>
)
