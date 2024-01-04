import { placesChildren } from './placesChildren'
import { buildNavs } from '../modules/navs'

export const placesLevel2 = (db) => ({
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
        crumb: (match) => ({
          text: match.params.place_id2,
          table: 'places',
          level: 2,
          folder: false,
        }),
        to: async (match) =>
          await buildNavs({
            table: `places`,
            ...match.params,
            db,
            level: 2,
          }),
      },
      children: [
        {
          index: true,
          lazy: () => import('../routes/place'),
        },
        ...placesChildren({ db, level: 2 }),
      ],
    },
  ],
})
