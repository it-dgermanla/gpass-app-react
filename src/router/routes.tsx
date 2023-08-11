import { lazy } from "react";
import { PathRouteProps } from 'react-router-dom';

const LandingPage = lazy(() => import('../views/landingPage'));

const routes: PathRouteProps[] = [
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '*',
    element: <div>404 not found</div>
  }
]

export default routes;