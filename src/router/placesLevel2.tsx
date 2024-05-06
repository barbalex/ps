import { placesChildren } from './placesChildren.tsx'

export const placesLevel2 = () => ({
  path: 'places',
  element: null,
  handle: {
    crumb: {
      text: 'Places',
      table: 'places',
      level: 2,
      folder: true,
    },
  },
  children: [
    {
      index: true,
      lazy: () => import('../routes/places.tsx'),
    },
    {
      path: ':place_id2',
      element: null,
      handle: {
        crumb: {
          table: 'places',
          level: 2,
          folder: false,
        },
        to: {
          table: `places`,
          level: 2,
        },
      },
      children: [
        {
          index: true,
          lazy: () => import('../routes/place/index.tsx'),
        },
        ...placesChildren({ level: 2 }),
      ],
    },
  ],
})
