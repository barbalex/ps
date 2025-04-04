export function ErrorPage({ error }) {
  console.error('Error caught by ErrorPage:', error)

  return (
    <div
      id="error-page"
      className="form-outer-container"
    >
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  )
}
