import { memo, useCallback } from 'react'
import * as React from 'react'
import { Button } from '@fluentui/react-components'
import { Link, useRouter, useCanGoBack } from '@tanstack/react-router'

const linkContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 20,
}
const noMarginStyle = {
  margin: 0,
}
const spacerStyle = {
  height: 20,
}

export const NotFound = memo((data) => {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const table = data?.table
  const id = data?.id
  const isTableId = table && id

  const goBack = useCallback(() => {
    router.history.back()
  }, [router])

  return (
    <div style={linkContentStyle}>
      {isTableId ?
        <>
          <p style={noMarginStyle}>Sorry. A {table} with ID</p>
          <em>{id}</em>
          <p style={noMarginStyle}>was not found.</p>
        </>
      : <p>Sorry. This page does not exist.</p>}
      <div style={spacerStyle} />
      {canGoBack ?
        <Button onClick={goBack}>Go Back</Button>
      : <Link to="../">
          <Button>Go One Up</Button>
        </Link>
      }
    </div>
  )
})
