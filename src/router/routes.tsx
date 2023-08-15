import { lazy } from "react";
import { PathRouteProps } from 'react-router-dom';

// const CreateBranch = lazy(() => import('../views/company/create'));
const LandingPage = lazy(() => import('../views/landingPage'));
const CompanyPage = lazy(() => import('../views/company'));

const routes: PathRouteProps[] = [
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/sucursales',
    element: <CompanyPage />
  },
  {
    path: '/sucursales/registrar',
    element: <CompanyPage />
  },
  {
    path: '*',
    element: <div>404 not found</div>
  }
]

export default routes;