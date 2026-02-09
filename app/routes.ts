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
        id: 'beds',
        path: 'beds',
        lazy: () => import('./routes/beds'),
      },
      {
        id: 'bed-detail',
        path: 'beds/:id',
        lazy: () => import('./routes/beds.$id'),
      },
      {
        id: 'calendar',
        path: 'calendar',
        lazy: () => import('./routes/calendar'),
      },
      {
        id: 'log',
        path: 'log',
        lazy: () => import('./routes/log'),
      },
      {
        id: 'settings',
        path: 'settings',
        lazy: () => import('./routes/settings'),
      },
    ],
  },
]
