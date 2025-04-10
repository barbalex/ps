import { memo, useCallback } from 'react'
import * as React from 'react'
import { Button } from '@fluentui/react-components'
import { Link, useRouter, useCanGoBack } from '@tanstack/react-router'

const containerStyle = {
  height: '100%',
  overflow: 'hidden',
}
const linkContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
}

export const NotFound = memo((data) => {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const table = data?.table
  const id = data?.id

  const goBack = useCallback(() => {
    router.history.back()
  }, [router])

  return (
    <div style={containerStyle}>
      <div style={linkContentStyle}>
        {table && id && (
          <p>
            Sorry. A {table} with ID {id} does not exist.
          </p>
        )}
        {canGoBack ?
          <Button onClick={goBack}>Go Back</Button>
        : <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        }
      </div>
    </div>
  )
})
