import { useState, useCallback, useEffect } from 'react'
import { Form, Input } from 'antd'

// const StyledFormControl = styled(FormControl)`
//   padding-bottom: 19px !important;
//   > div:before {
//     border-bottom-color: rgba(0, 0, 0, 0.1) !important;
//   }
// `
// // no idea why but this font-size is shrunken!
// const StyledInputLabel = styled(InputLabel)`
//   font-weight: ${(props) => props['data-weight']} !important;
//   color: rgba(0, 0, 0, 0.8);
//   font-size: 1rem;
// `

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
  // labelWeight = 400,
  name,
  type = 'text',
  // multiLine = false,
  disabled = false,
  hintText = '',
  helperText = '',
  error,
  onBlur,
  // schrinkLabel = true,
  hideLabel = false,
}: Props) => {
  // const [stateValue, setStateValue] = useState<string | number>(
  //   value || value === 0 ? value : '',
  // )
  // useEffect(() => {
  //   setStateValue(value || value === 0 ? value : '')
  // }, [value])
  // const onChange = useCallback((event) => setStateValue(event.target.value), [])

  const onKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        onBlur(event)
      }
    },
    [onBlur],
  )

  // console.log('TextField', { label, multiLine })

  return (
    <Form.Item label={!hideLabel && label} name={name}>
      <Input
        value={value}
        disabled={disabled}
        type={type}
        // multiline={multiLine}
        status={error ? 'error' : helperText ? 'warning' : undefined}
        help={error}
        // onChange={onChange}
        // onBlur={onBlur}
        onKeyPress={onKeyPress}
        placeholder={hintText}
      />
    </Form.Item>
  )
}
