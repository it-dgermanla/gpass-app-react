import { Layout } from 'antd';
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import MenuComponent from '../../components/menu';
import Breadcrumb from '../../components/breadcrumb';
import FullLoader from "../../components/fullLoader";

const RoterChecker = () => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== "/") {
      navigate('/');
      return;
    }
  }, [user, pathname, navigate, loading])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {user ? <MenuComponent /> : null}
      <Layout.Content style={{ padding: user ? "2vh" : 0 }}>
        {user && <Breadcrumb />}
        <Suspense fallback={<FullLoader />}>
          <Outlet />
        </Suspense>
      </Layout.Content>
    </Layout>
  )
}

export default RoterChecker;