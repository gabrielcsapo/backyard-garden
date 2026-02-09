import type { unstable_RSCRouteConfigEntry } from 'react-router'

export const routes: unstable_RSCRouteConfigEntry[] = [
  {
    id: 'root',
    path: '',
    lazy: () => import('./root'),
    children: [
      {
        id: 'home',
        index: true,
        lazy: () => import('./routes/home'),
      },
      {
        id: 'yard',
        path: 'yard',
        lazy: () => import('./routes/yard'),
      },
      {
        id: 'plants',
        path: 'plants',
        lazy: () => import('./routes/plants'),
      },
      {
        id: 'settings',
        path: 'settings',
        lazy: () => import('./routes/settings'),
      },
    ],
  },
]
