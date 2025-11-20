import { Spinner } from '@fluentui/react-components'

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
}

export const Loading = ({
  label,
  alignLeft = false,
  size = 'medium',
  width,
}) => (
  <div
    style={{
      ...containerStyle,
      justifyContent: alignLeft ? 'flex-start' : 'center',
      ...(width ? { width } : {}),
    }}
  >
    <Spinner
      labelPosition="below"
      label={label}
      size={size}
    />
  </div>
)
