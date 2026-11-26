import { Button, MenuTrigger, Tooltip } from '@fluentui/react-components'
import { useIntl } from 'react-intl'
import { MdDeleteOutline } from 'react-icons/md'

import styles from './index.module.css'

export const DeleteLayerTrigger = ({ label }: { label: string }) => {
  const { formatMessage } = useIntl()
  const text = formatMessage(
    { id: 'layerDeleteBtnTitle', defaultMessage: 'Layer {label} löschen' },
    { label },
  )
  return (
    <MenuTrigger disableButtonEnhancement>
      <Tooltip content={text} relationship="label">
        <Button
          size="medium"
          icon={<MdDeleteOutline />}
          aria-label={text}
          className={styles.deleteButton}
        />
      </Tooltip>
    </MenuTrigger>
  )
}
