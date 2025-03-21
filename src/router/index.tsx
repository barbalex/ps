import React from 'react'
import { createBrowserRouter } from 'react-router'

import { ErrorPage } from '../routes/error.tsx'
import { placesChildren } from './placesChildren.tsx'
import { placesLevel2 } from './placesLevel2.tsx'

import { Filter } from '../components/shared/Filter/index.tsx'

export const router = () => {
  // confirmed: this is called only once
  // console.log('router building')

  return createBrowserRouter([
    {
      path: 'places',
      element: null,
      handle: {
        crumb: {
          text: 'Places',
          table: 'places',
          level: 1,
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
          element: <Filter level={1} />,
          children: [
            {
              index: true,
              lazy: () => import('../routes/place/Form.tsx'),
            },
          ],
        },
        {
          path: ':place_id',
          element: null,
          handle: {
            crumb: {
              table: 'places',
              level: 1,
              folder: false,
            },
            to: {
              table: `places`,
            },
          },
          children: [
            {
              index: true,
              lazy: () => import('../routes/place/index.tsx'),
            },
            placesLevel2(),
            ...placesChildren({ level: 1 }),
          ],
        },
      ],
    },
  ])
}
