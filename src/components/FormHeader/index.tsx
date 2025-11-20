import { FormMenu } from '../FormMenu/index.tsx'

const titleStyle = {
  color: 'black',
}

export const FormHeader = ({
  title,
  addRow,
  deleteRow,
  toNext,
  toPrevious,
  tableName,
  siblings,
  // needed to leave space for the map layer drawer's close button
  titleMarginLeft,
}) => {
  return (
    <>
      <div className="form-header">
        <h1
          style={{
            ...titleStyle,
            ...(titleMarginLeft ? { marginLeft: titleMarginLeft } : {}),
          }}
        >
          {title}
        </h1>
        {(addRow || deleteRow || toNext || toPrevious || siblings) && (
          <FormMenu
            addRow={addRow}
            deleteRow={deleteRow}
            toNext={toNext}
            toPrevious={toPrevious}
            nameSingular={tableName}
            siblings={siblings}
          />
        )}
      </div>
    </>
  )
}
