import { Button } from '@fluentui/react-components'

const containerStyle = {
  padding: 15,
}
const buttonContainerStyle = {
  marginRight: 10,
  marginBottom: 10,
}
const preWrappingStyle = {
  whiteSpace: 'normal',
}

const onReload = () => {
  window.location.reload(true)
}

interface Props {
  error: Error
}

// TODO: empty cache for second button
export const RouterErrorBoundary = ({ error }: Props) => (
  <div style={containerStyle}>
    <p>Sorry, ein Fehler ist aufgetreten:</p>
    <pre style={preWrappingStyle}>{error.message}</pre>
    <div style={buttonContainerStyle}>
      <Button
        appearance="primary"
        onClick={onReload}
      >
        neu starten
      </Button>
    </div>
    <div style={buttonContainerStyle}>
      <Button
        appearance="secondary"
        onClick={onReload}
      >
        Cache leeren und neu starten (neue Anmeldung nötig)
      </Button>
    </div>
  </div>
)
