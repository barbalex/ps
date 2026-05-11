import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { Link } from '@tanstack/react-router'

import { Header } from './Layout/Header/index.tsx'
import styles from './NotFoundRoot.module.css'

export const NotFoundRoot = () => (
  <>
    <Header />
    <div className={styles.homeOutlet}>
      <div className={styles.container}>
        <picture>
          <source
            srcSet="puls_700.avif 700w, puls_1000.avif 1000w, puls_1400.avif 1400w, puls_1550.avif 1550w"
            type="image/avif"
          />
          <img
            src="puls_700.avif"
            srcSet="puls_700.avif 700w, puls_1000.avif 1000w, puls_1400.avif 1400w, puls_1550.avif 1550w"
            sizes="100vw"
            alt="Pulsatilla"
            className="img"
          />
        </picture>
        <div className={styles.content}>
          <h6 className="page-title">Sorry. This page does not exist</h6>
          <div className={styles.linkContent}>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </>
)
