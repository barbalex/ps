import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { Link, useRouter, useCanGoBack } from '@tanstack/react-router'
import type { NotFoundRouteProps } from '@tanstack/react-router'

import styles from './NotFound.module.css'

interface Props extends Partial<NotFoundRouteProps> {
  table?: string
  id?: string
}

export const NotFound = ({ table, id }: Props) => {
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
      : <Link to={'../' as '..'}>
          <Button>Go One Up</Button>
        </Link>
      }
    </div>
  )
}
