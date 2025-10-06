import { memo } from 'react'
import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary'
import { Button } from '@fluentui/react-components'
import { pipe } from 'remeda'

import { on } from '../../css.ts'

const containerStyle = {
  padding: 15,
}
const buttonContainerStyle = {
  marginRight: 10,
  marginBottom: 10,
}
const detailsStyle = {
  marginBottom: 25,
}
const preWrappingStyle = {
  whiteSpace: 'normal',
}
const preStyle = {
  backgroundColor: 'rgba(128, 128, 128, 0.09)',
}

const onReload = () => {
  window.location.reload(true)
}

interface Props {
  error: Error
  componentStack: string
  resetErrorBoundary: () => void
}

const ErrorFallback = ({
  error,
  componentStack,
  resetErrorBoundary,
}: Props) => (
  <div style={containerStyle}>
    <p>Sorry, ein Fehler ist aufgetreten:</p>
    <pre style={preWrappingStyle}>{error.message}</pre>
    <details style={detailsStyle}>
      <summary
        style={pipe(
          {
            userSelect: 'none',
          },
          on('&:focus', {
            outline: 'none !important',
          }),
        )}
      >
        Mehr Informationen
      </summary>
      <pre style={preStyle}>{componentStack}</pre>
    </details>
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
        onClick={resetErrorBoundary}
      >
        Cache leeren und neu starten (neue Anmeldung nötig)
      </Button>
    </div>
  </div>
)

export const ErrorBoundary = memo(({ children }) => (
  <ErrorBoundaryComponent
    FallbackComponent={ErrorFallback}
    onReset={onReload}
  >
    {children}
  </ErrorBoundaryComponent>
))
