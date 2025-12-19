import { Button } from '@fluentui/react-components'
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
            srcSet="home_700.avif 700w, home_1000.avif 1000w, home_1400.avif 1400w, home_2000.avif 2000w, home_2500.avif 2500w"
            type="image/avif"
          />
          <img
            src="home_700.webp"
            srcSet="home_700.webp 700w, home_1000.webp 1000w, home_1400.webp 1400w, home_2000.webp 2000w, home_2500.webp 2500w"
            sizes="100vw"
            alt="Spinnen-Ragwurz"
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
