import { Breadcrumb as BreadcrumbAnt } from 'antd';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import menuItems from "../menu/menuItems";

const Breadcrumb = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { icon, paths } = useMemo(() => {
    const paths = pathname.split("/");
    const pathIcon = "/" + paths[1];
    const icon = menuItems.find(mi => mi?.key === pathIcon)?.icon;
    paths.splice(0, 1);

    return {
      icon,
      paths
    }
  }, [pathname])

  const toPath = (path: string, index: number) => {
    const paths = pathname.split("/");
    const indexPath = paths.indexOf(path.toLowerCase().replaceAll(" ", "-"));
    const toPaths = paths.slice(0, indexPath + 1);
    toPaths.splice(0, 1);

    let to = "";

    toPaths.forEach((path) => {
      to += ("/" + path)
    });

  if (to.includes("configuracion") || index > 0) return;

    navigate(to);
  }

  return (
    <div style={{ display: "flex" }}>
      <div style={{ marginRight: 10 }}>
        {icon}
      </div>
      <BreadcrumbAnt
        items={
          paths.map((path, index) => ({
            title: path.charAt(0).toUpperCase() + path.slice(1),
            href: "",
            onClick: () => toPath(path, index)
          }))
        }
      />
    </div>
  )
}

export default Breadcrumb;