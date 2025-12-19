import * as React from 'react'
import { Button } from '@fluentui/react-components'
import { Link, useRouter, useCanGoBack } from '@tanstack/react-router'

import styles from './NotFound.module.css'

export const NotFound = ({ table, id }) => {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const isTableId = table && id

  const goBack = () => router.history.back()

  return (
    <div className={styles.linkContent}>
      {isTableId ?
        <>
          <p className={styles.noMargin}>Sorry. {table} with ID</p>
          <em>{id}</em>
          <p className={styles.noMargin}>was not found.</p>
        </>
      : <p>Sorry. This page does not exist.</p>}
      <div className={styles.spacer} />
      {canGoBack ?
        <Button onClick={goBack}>Go Back</Button>
      : <Link to="../">
          <Button>Go One Up</Button>
        </Link>
      }
    </div>
  )
}
