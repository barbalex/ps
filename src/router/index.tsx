import React from 'react'
import { createBrowserRouter } from 'react-router'

import { ErrorPage } from '../formsAndLists/error.tsx'
import { placesChildren } from './placesChildren.tsx'
import { placesLevel2 } from './placesLevel2.tsx'

import { Filter } from '../components/shared/Filter/index.tsx'

export const router = () => {
  // confirmed: this is called only once
  // console.log('router building')

  return createBrowserRouter([
    {
      index: true,
      lazy: () => import('../routes/place/index.tsx'),
    },
    placesLevel2(),
    ...placesChildren({ level: 1 }),
  ])
}
