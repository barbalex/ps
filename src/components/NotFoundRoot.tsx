import { memo } from 'react'
import * as React from 'react'
import { Button } from '@fluentui/react-components'
import { Link } from '@tanstack/react-router'

import { Header } from './Layout/Header/index.tsx'

const homeOutletStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
}
const containerStyle = {
  height: '100%',
  overflow: 'hidden',
}
const contentStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute',
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
}
const linkContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
}

export const NotFoundRoot = memo(() => (
  <>
    <Header />
    <div style={homeOutletStyle}>
      <div style={containerStyle}>
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
        <div style={contentStyle}>
          <h6 className="page-title">Sorry. This page does not exist</h6>
          <div style={linkContentStyle}>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </>
))
