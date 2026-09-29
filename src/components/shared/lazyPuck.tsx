import { lazy } from 'react'

// Lazy boundaries around everything that imports @puckeditor/core at
// runtime. The package ships its editor and its render path as separate
// internal modules, so keeping the two consumers in separate wrapper
// modules lets the bundler split them: report views load only the render
// code, the design routes add the editor on top.
export const LazyPuckEditor = lazy(() =>
  import('./PuckEditor.tsx').then((m) => ({ default: m.PuckEditor })),
)

export const LazyPuckRender = lazy(() =>
  import('./PuckRender.tsx').then((m) => ({ default: m.PuckRender })),
)
