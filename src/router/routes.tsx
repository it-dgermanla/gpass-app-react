import { lazy } from "react";
import { PathRouteProps } from 'react-router-dom';

const LandingPage = lazy(() => import('../views/landingPage'));
const Companies = lazy(() => import('../views/companies'));
const Events = lazy(() => import('../views/events'));

const routes: PathRouteProps[] = [
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/empresas',
    element: <Companies />
  },
  {
    path: "/eventos",
    element: <Events />
  },
  {
    path: '*',
    element: <div>404 not found</div>
  }
]

export default routes;