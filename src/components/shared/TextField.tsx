import { useState, useCallback, useEffect } from 'react'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import styled from '@emotion/styled'

const StyledFormControl = styled(FormControl)`
  padding-bottom: 19px !important;
  > div:before {
    border-bottom-color: rgba(0, 0, 0, 0.1) !important;
  }
`
// no idea why but this font-size is shrunken!
const StyledInputLabel = styled(InputLabel)`
  font-weight: ${(props) => props['data-weight']} !important;
  color: rgba(0, 0, 0, 0.8);
  font-size: 1rem;
`

type Props = {
  value: string | number | null | undefined
  label: string
  labelWeight?: number
  name: string
  type?: string
  multiLine?: boolean
  disabled?: boolean
  hintText?: string
  helperText?: string
  error?: string
  onBlur: () => void
  schrinkLabel?: boolean
  hideLabel?: boolean
}

export const TextField = ({
  value,
  label,
  labelWeight = 400,
  name,
  type = 'text',
  multiLine = false,
  disabled = false,
  hintText = '',
  helperText = '',
  error,
  onBlur,
  schrinkLabel = true,
  hideLabel = false,
}: Props) => {
  const [stateValue, setStateValue] = useState<string | number>(
    value || value === 0 ? value : '',
  )
  useEffect(() => {
    setStateValue(value || value === 0 ? value : '')
  }, [value])
  const onChange = useCallback((event) => setStateValue(event.target.value), [])

  const onKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        onBlur(event)
      }
    },
    [onBlur],
  )

  // once schrink is set, need to manually control ist
  // schrink if value exists or schrinkLabel was passed
  const schrink = schrinkLabel || !!value || value === 0

  // console.log('TextField', { label, multiLine })

  return (
    <StyledFormControl
      fullWidth
      disabled={disabled}
      error={!!error}
      aria-describedby={`${label}ErrorText`}
      variant="standard"
    >
      {!hideLabel && (
        <StyledInputLabel
          htmlFor={label}
          shrink={schrink}
          data-weight={labelWeight}
        >
          {label}
        </StyledInputLabel>
      )}
      <Input
        id={label}
        name={name}
        value={stateValue}
        type={type}
        multiline={multiLine}
        onChange={onChange}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        placeholder={hintText}
      />
      {!!error && (
        <FormHelperText id={`${label}ErrorText`}>{error}</FormHelperText>
      )}
      {!!helperText && (
        <FormHelperText id={`${label}HelperText`}>{helperText}</FormHelperText>
      )}
    </StyledFormControl>
  )
}
