import * as fluentUiReactComponents from '@fluentui/react-components'
const { Toolbar, ToolbarToggleButton, Tooltip } = fluentUiReactComponents
import { FormattedMessage, useIntl } from 'react-intl'
import { TbArrowsMaximize, TbArrowsMinimize } from 'react-icons/tb'

import styles from './Menu.module.css'

const buildToggleClass = ({ prevIsActive, nextIsActive, selfIsActive }) => {
  if (!selfIsActive) {
    return styles.toggleInactive
  }

  let className = styles.toggleActive

  if (prevIsActive) {
    className += ` ${styles.togglePrevIsActive}`
  }
  if (nextIsActive) {
    className += ` ${styles.toggleNextIsActive}`
  }

  return className
}

type Props = {
  tabs: string[]
  isHome: boolean
  mapIsMaximized: boolean
  onChangeTabs: (_e: unknown, data: { checkedItems: string[] }) => void
  onClickMapView: (event: unknown) => void
}

export const Tabs = ({
  tabs,
  isHome,
  mapIsMaximized,
  onChangeTabs,
  onClickMapView,
}: Props) => {
  const intl = useIntl()
  const treeIsActive = tabs.includes('tree')
  const dataIsActive = tabs.includes('data')
  const mapIsActive = tabs.includes('map')

  return (
    <Toolbar
      className={styles.toolbar}
      aria-label="active tabs"
      checkedValues={{ tabs }}
      onCheckedValueChange={onChangeTabs}
    >
      {!isHome && (
        <>
          <Tooltip
            content={
              treeIsActive
                ? intl.formatMessage({ defaultMessage: 'Baum ausblenden' })
                : intl.formatMessage({ defaultMessage: 'Baum einblenden' })
            }
          >
            <ToolbarToggleButton
              aria-label={intl.formatMessage({ defaultMessage: 'Baum' })}
              name="tabs"
              value="tree"
              className={buildToggleClass({
                prevIsActive: false,
                nextIsActive: dataIsActive,
                selfIsActive: treeIsActive,
              })}
              disabled={mapIsMaximized}
            >
              <FormattedMessage defaultMessage="Baum" />
            </ToolbarToggleButton>
          </Tooltip>
          <Tooltip
            content={
              dataIsActive
                ? intl.formatMessage({ defaultMessage: 'Daten ausblenden' })
                : intl.formatMessage({ defaultMessage: 'Daten einblenden' })
            }
          >
            <ToolbarToggleButton
              aria-label={intl.formatMessage({ defaultMessage: 'Daten' })}
              name="tabs"
              value="data"
              className={buildToggleClass({
                prevIsActive: treeIsActive,
                nextIsActive: mapIsActive,
                selfIsActive: dataIsActive,
              })}
              disabled={mapIsMaximized}
            >
              <FormattedMessage defaultMessage="Daten" />
            </ToolbarToggleButton>
          </Tooltip>
          <Tooltip
            content={
              mapIsActive
                ? intl.formatMessage({ defaultMessage: 'Karte ausblenden' })
                : intl.formatMessage({ defaultMessage: 'Karte einblenden' })
            }
          >
            <ToolbarToggleButton
              icon={
                !mapIsActive ? undefined : mapIsMaximized ? (
                  <Tooltip
                    content={intl.formatMessage({
                      defaultMessage: 'Karte verkleinern',
                    })}
                  >
                    <TbArrowsMinimize
                      onClick={onClickMapView}
                      className={styles.mapIcon}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip
                    content={intl.formatMessage({
                      defaultMessage: 'Karte maximieren',
                    })}
                  >
                    <TbArrowsMaximize
                      onClick={onClickMapView}
                      className={styles.mapIcon}
                    />
                  </Tooltip>
                )
              }
              iconPosition="after"
              aria-label={intl.formatMessage({ defaultMessage: 'Karte' })}
              name="tabs"
              value="map"
              className={buildToggleClass({
                prevIsActive: dataIsActive,
                nextIsActive: false,
                selfIsActive: mapIsActive,
              })}
            >
              <FormattedMessage defaultMessage="Karte" />
            </ToolbarToggleButton>
          </Tooltip>
        </>
      )}
    </Toolbar>
  )
}