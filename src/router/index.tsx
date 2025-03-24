import { createBrowserRouter } from 'react-router'


export const router = () => {
  // confirmed: this is called only once
  // console.log('router building')

  return createBrowserRouter([
    {
      index: true,
      lazy: () => import('../routes/place/index.tsx'),
    },
  ])
}
