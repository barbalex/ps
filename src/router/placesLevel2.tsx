import { placesChildren } from './placesChildren'

export const placesLevel2 = () => ({
  path: 'places',
  element: null,
  handle: {
    crumb: () => ({
      text: 'Places',
      table: 'places',
      level: 2,
      folder: true,
    }),
  },
  children: [
    {
      index: true,
      lazy: () => import('../routes/places'),
    },
    {
      path: ':place_id2',
      element: null,
      handle: {
        crumb: () => ({
          table: 'places',
          level: 2,
          folder: false,
        }),
        to: {
          table: `places`,
          level: 2,
        },
      },
      children: [
        {
          index: true,
          lazy: () => import('../routes/place'),
        },
        ...placesChildren({ level: 2 }),
      ],
    },
  ],
})
