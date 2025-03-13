import { useRouteError } from 'react-router'

export function ErrorPage() {
  const error = useRouteError()
  console.error(error)

  return (
    <div id="error-page" className="form-outer-container">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  )
}
