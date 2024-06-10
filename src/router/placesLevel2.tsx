import { placesChildren } from './placesChildren.tsx'
import { Filter } from '../components/shared/Filter/index.tsx'

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
      path: 'filter',
      element: <Filter level={2} />,
      children: [
        {
          index: true,
          lazy: () => import('../routes/place/Form.tsx'),
        },
      ],
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
