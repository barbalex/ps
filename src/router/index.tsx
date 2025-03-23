import { createBrowserRouter } from 'react-router'

import { placesChildren } from './placesChildren.tsx'
import { placesLevel2 } from './placesLevel2.tsx'

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
