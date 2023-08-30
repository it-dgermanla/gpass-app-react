import { lazy } from "react";
import { PathRouteProps } from 'react-router-dom';
import UsersRegister from "../views/users/create";
import Tickets from "../views/events/tikets";

const LandingPage = lazy(() => import('../views/landingPage'));
const Companies = lazy(() => import('../views/companies'));
const CompaniesRegister = lazy(() => import('../views/companies/create'));
const Events = lazy(() => import('../views/events'));
const EventsRegister = lazy(() => import('../views/events/create'));
const Users = lazy(() => import('../views/users'));
const Lector = lazy(() => import('../views/qr'));

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
    path: '/empresas/registrar',
    element: <CompaniesRegister />
  },
  {
    path: '/empresas/editar',
    element: <CompaniesRegister />
  },
  {
    path: "/eventos",
    element: <Events />
  },
  {
    path: "/eventos/registrar",
    element: <EventsRegister />
  },
  {
    path: '/eventos/editar',
    element: <EventsRegister />
  },
  {
    path: '/eventos/boletos',
    element: <Tickets />
  },
  {
    path: '/lector',
    element: <Lector />
  },
  {
    path: "/usuarios",
    element: <Users />
  },
  {
    path: "/usuarios/registrar",
    element: <UsersRegister />
  },
  {
    path: '*',
    element: <div>404 not found</div>
  }
]

export default routes;