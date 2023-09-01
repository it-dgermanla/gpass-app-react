import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import menuItems from './menuItems';
import RowHeader from './rowHeader';
import { privateRoutesByUser } from './../../constants';
import { useAuth } from '../../context/authContext';
import { Rols } from '../../types';

const { Sider: SiderAnt } = Layout;

const Sider = () => {
  const [collapsed, setCollapsed] = useState<boolean | undefined>(false);
  const location = useLocation();
  const { user, loading } = useAuth();
  const onCollapse = (collapsed: boolean | undefined) => setCollapsed(collapsed);

  const filteredMenuItems = useMemo(() => {
    if (loading) return []

    return menuItems.filter(item => privateRoutesByUser[user?.displayName as Rols].includes(item.key) || item.key === '/configuracion');
  }, [user, loading])

  return (
    <SiderAnt
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
    >
      <br />
      <RowHeader collapsed={collapsed} />
      <Menu
        style={{ marginTop: 20 }}
        theme="dark"
        selectedKeys={["/" + location.pathname.split("/")[1]]}
        items={filteredMenuItems}
      />
    </SiderAnt>
  )
}

export default Sider;
