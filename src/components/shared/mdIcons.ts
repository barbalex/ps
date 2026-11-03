// Self-contained copies of the react-icons/md icons used by eagerly loaded
// code (the home header menu and the theme chooser). Eager code must not
// import from 'react-icons/md': the marker symbol picker imports that module
// as a namespace, which keeps all ~2000 of its icons alive and unshakeable;
// any eager import of the module then drags the entire set into the entry
// chunk (~400 KiB gzipped). Lazy code can keep importing from
// 'react-icons/md' directly. Tree data extracted verbatim from
// react-icons/md (MIT) — re-extract if the icons ever need updating.
import { GenIcon } from 'react-icons/lib'
import type { IconBaseProps } from 'react-icons/lib'

export const MdHome = (props: IconBaseProps) =>
  GenIcon({
    tag: 'svg',
    attr: {
      viewBox: '0 0 24 24',
    },
    child: [
      {
        tag: 'path',
        attr: {
          fill: 'none',
          d: 'M0 0h24v24H0z',
        },
        child: [],
      },
      {
        tag: 'path',
        attr: {
          d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
        },
        child: [],
      },
    ],
  })(props)

export const MdLogin = (props: IconBaseProps) =>
  GenIcon({
    tag: 'svg',
    attr: {
      viewBox: '0 0 24 24',
    },
    child: [
      {
        tag: 'path',
        attr: {
          fill: 'none',
          d: 'M0 0h24v24H0z',
        },
        child: [],
      },
      {
        tag: 'path',
        attr: {
          d: 'M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8z',
        },
        child: [],
      },
    ],
  })(props)

export const MdMenuBook = (props: IconBaseProps) =>
  GenIcon({
    tag: 'svg',
    attr: {
      viewBox: '0 0 24 24',
    },
    child: [
      {
        tag: 'path',
        attr: {
          fill: 'none',
          d: 'M0 0h24v24H0z',
        },
        child: [],
      },
      {
        tag: 'path',
        attr: {
          d: 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1m0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5z',
        },
        child: [],
      },
      {
        tag: 'path',
        attr: {
          d: 'M17.5 10.5c.88 0 1.73.09 2.5.26V9.24c-.79-.15-1.64-.24-2.5-.24-1.7 0-3.24.29-4.5.83v1.66c1.13-.64 2.7-.99 4.5-.99M13 12.49v1.66c1.13-.64 2.7-.99 4.5-.99.88 0 1.73.09 2.5.26V11.9c-.79-.15-1.64-.24-2.5-.24-1.7 0-3.24.3-4.5.83M17.5 14.33c-1.7 0-3.24.29-4.5.83v1.66c1.13-.64 2.7-.99 4.5-.99.88 0 1.73.09 2.5.26v-1.52c-.79-.16-1.64-.24-2.5-.24',
        },
        child: [],
      },
    ],
  })(props)

export const MdBrightnessAuto = (props: IconBaseProps) =>
  GenIcon({
    tag: 'svg',
    attr: {
      viewBox: '0 0 24 24',
    },
    child: [
      {
        tag: 'path',
        attr: {
          fill: 'none',
          d: 'M0 0h24v24H0z',
        },
        child: [],
      },
      {
        tag: 'path',
        attr: {
          d: 'M10.85 12.65h2.3L12 9zM20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12zM14.3 16l-.7-2h-3.2l-.7 2H7.8L11 7h2l3.2 9z',
        },
        child: [],
      },
    ],
  })(props)

export const MdDarkMode = (props: IconBaseProps) =>
  GenIcon({
    tag: 'svg',
    attr: {
      viewBox: '0 0 24 24',
    },
    child: [
      {
        tag: 'path',
        attr: {
          fill: 'none',
          d: 'M0 0h24v24H0z',
        },
        child: [],
      },
      {
        tag: 'path',
        attr: {
          d: 'M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1',
        },
        child: [],
      },
    ],
  })(props)

export const MdLightMode = (props: IconBaseProps) =>
  GenIcon({
    tag: 'svg',
    attr: {
      viewBox: '0 0 24 24',
    },
    child: [
      {
        tag: 'path',
        attr: {
          fill: 'none',
          d: 'M0 0h24v24H0z',
        },
        child: [],
      },
      {
        tag: 'path',
        attr: {
          d: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0z',
        },
        child: [],
      },
    ],
  })(props)
