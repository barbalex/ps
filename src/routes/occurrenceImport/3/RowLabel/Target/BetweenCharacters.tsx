import { useCallback } from 'react'
import TextField from '@mui/material/TextField'
import styled from '@emotion/styled'

import { dexie, ITable } from '../../../../../dexieClient'
import { TargetElement } from './TargetElements'

const Container = styled.div`
  position: relative;
`
const StyledTextField = styled(TextField)`
  margin-right: 6px;
  margin-bottom: 0;
  width: 100px;
  label {
    font-size: small !important;
    padding-left: 6px;
  }
  input {
    font-size: small !important;
  }
`

interface Props {
  el: TargetElement
  rowState: ITable
  index: number
}

const BetweenCharacters = ({
  el,
  rowState,
  index,
  children,
}: Props): PropsWithChildren => {
  const onBlur = useCallback(
    (event) => {
      const clonedRowLabel = [...rowState.current.row_label]
      clonedRowLabel[index].text = event.target.value
      const newRowLabel = clonedRowLabel.length ? clonedRowLabel : null
      const newRow = {
        ...rowState.current,
        row_label: newRowLabel,
      }
      rowState.current = newRow
      dexie.ttables.update(rowState.current.id, { row_label: newRowLabel })
    },
    [index, rowState],
  )
  return (
    <Container>
      <StyledTextField
        label="Zeichen"
        variant="outlined"
        margin="dense"
        size="small"
        defaultValue={el.text ?? ''}
        onBlur={onBlur}
      />
      {children}
    </Container>
  )
}

export default BetweenCharacters
