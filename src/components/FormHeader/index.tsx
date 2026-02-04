import { FormMenu } from '../FormMenu/index.tsx'
import styles from './index.module.css'

export const FormHeader = ({
  title,
  addRow,
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
  </>
)
