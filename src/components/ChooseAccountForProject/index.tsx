import * as fluentUiReactComponents from '@fluentui/react-components'
const {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
} = fluentUiReactComponents
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { chooseAccountForProjectAtom } from '../../store.ts'
import styles from './index.module.css'

export const ChooseAccountForProject = () => {
  const { formatMessage } = useIntl()
  const [state, setState] = useAtom(chooseAccountForProjectAtom)

  const onCancel = () => setState(null)

  const onSelect = (account_id: string) => {
    const cb = state?.onAccountSelected
    setState(null)
    cb?.(account_id)
  }

  if (!state) return null

  return (
    <Dialog open={true}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>
            {formatMessage({
              id: 'chooseAccountForProject',
              defaultMessage: 'Konto für das neue Projekt wählen',
            })}
          </DialogTitle>
          <DialogContent className={styles.content}>
            {state.accounts.map((account) => (
              <Button
                key={account.account_id}
                appearance="secondary"
                className={styles.accountButton}
                onClick={() => onSelect(account.account_id)}
              >
                {account.label ?? account.account_id}
              </Button>
            ))}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onCancel}>
              {formatMessage({ id: 'cancel', defaultMessage: 'Abbrechen' })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
