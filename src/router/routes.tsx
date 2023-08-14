import { lazy } from "react";
import { PathRouteProps } from 'react-router-dom';

const LandingPage = lazy(() => import('../views/landingPage'));
const CompanyPage = lazy(() => import('../views/company'));

const routes: PathRouteProps[] = [
  {
    path: '/',
    element: <CompanyPage />
  },
  {
    path: '/sucursales',
    element: <CompanyPage />
  },
  {
    path: '*',
    element: <div>404 not found</div>
  }
]

export default routes;